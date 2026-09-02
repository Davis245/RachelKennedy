create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.is_admin_user(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = check_user_id
  );
$$;

revoke all on function public.is_admin_user(uuid) from public;
grant execute on function public.is_admin_user(uuid) to anon, authenticated;

create or replace function public.sync_post_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());

  if new.status = 'published' then
    new.published_at := coalesce(new.published_at, timezone('utc'::text, now()));
  else
    new.published_at := null;
  end if;

  return new;
end;
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  cover_image_url text,
  cover_image_alt text,
  location text,
  country text,
  travel_start_date date,
  travel_end_date date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  published_at timestamptz,
  constraint posts_content_document_check check (
    jsonb_typeof(content) = 'object'
    and content ->> 'type' = 'doc'
    and jsonb_typeof(content -> 'content') = 'array'
  ),
  constraint posts_travel_dates_check check (
    travel_end_date is null
    or travel_start_date is null
    or travel_end_date >= travel_start_date
  ),
  constraint posts_publication_state_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
  )
);

comment on column public.posts.content is
  'Rich-text content is stored as a Tiptap/ProseMirror-compatible JSON document with a top-level object like {"type":"doc","content":[...]}';

create trigger posts_sync_timestamps
before insert or update on public.posts
for each row
execute function public.sync_post_timestamps();

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  image_url text not null,
  alt_text text not null check (char_length(btrim(alt_text)) > 0),
  caption text,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  visitor_identifier_hash text not null check (char_length(btrim(visitor_identifier_hash)) > 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint post_likes_post_id_visitor_identifier_hash_key unique (post_id, visitor_identifier_hash)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) > 0),
  private_email text,
  comment_text text not null check (char_length(btrim(comment_text)) > 0),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists post_images_post_id_display_order_idx on public.post_images (post_id, display_order);
create index if not exists post_likes_post_id_created_at_idx on public.post_likes (post_id, created_at desc);
create index if not exists comments_post_id_moderation_status_created_at_idx on public.comments (post_id, moderation_status, created_at desc);
create index if not exists posts_status_published_at_idx on public.posts (status, published_at desc);

alter table public.admin_users enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;

create policy "Admin users can view their own membership"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

create policy "Existing admins can manage admin memberships"
on public.admin_users
for all
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

create policy "Published posts are publicly readable"
on public.posts
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage posts"
on public.posts
for all
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

create policy "Published post images are publicly readable"
on public.post_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.status = 'published'
  )
);

create policy "Admins can manage post images"
on public.post_images
for all
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

create policy "Visitors can like published posts"
on public.post_likes
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_likes.post_id
      and posts.status = 'published'
  )
);

create policy "Admins can view likes"
on public.post_likes
for select
to authenticated
using (public.is_admin_user(auth.uid()));

create policy "Admins can delete likes"
on public.post_likes
for delete
to authenticated
using (public.is_admin_user(auth.uid()));

create policy "Visitors can submit pending comments on published posts"
on public.comments
for insert
to anon, authenticated
with check (
  moderation_status = 'pending'
  and exists (
    select 1
    from public.posts
    where posts.id = comments.post_id
      and posts.status = 'published'
  )
);

create policy "Admins can manage comments"
on public.comments
for all
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

-- Keep private_email inaccessible to public readers. RLS filters rows, not
-- columns, so public comment reads go through this deliberately limited view.
revoke all on table public.comments from public, anon, authenticated;
grant insert on table public.comments to anon, authenticated;
grant select, insert, update, delete on table public.comments to authenticated;

create or replace view public.approved_comments
with (security_barrier = true)
as
select
  comments.id,
  comments.post_id,
  comments.display_name,
  comments.comment_text,
  comments.created_at
from public.comments
join public.posts on posts.id = comments.post_id
where comments.moderation_status = 'approved'
  and posts.status = 'published';

comment on view public.approved_comments is
  'Public approved comments without the private_email or moderation fields. Admins use the comments table directly.';

revoke all on table public.approved_comments from public;
grant select on public.approved_comments to anon, authenticated;

create or replace view public.post_like_totals as
select
  posts.id as post_id,
  count(post_likes.id)::bigint as like_count
from public.posts
left join public.post_likes on post_likes.post_id = posts.id
where posts.status = 'published'
group by posts.id;

comment on view public.post_like_totals is
  'Public aggregate like counts for published posts. Query this view instead of reading public.post_likes directly.';

grant select on public.post_like_totals to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Post images bucket is publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'post-images');

create policy "Admins can upload post images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and public.is_admin_user(auth.uid())
);

create policy "Admins can update post images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_admin_user(auth.uid())
)
with check (
  bucket_id = 'post-images'
  and public.is_admin_user(auth.uid())
);

create policy "Admins can delete post images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_admin_user(auth.uid())
);
