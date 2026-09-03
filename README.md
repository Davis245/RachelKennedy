# Rachel Kennedy Travel Blog

A custom travel blog for Rachel Kennedy, built around photography, destinations, and personal travel stories.

## Product direction

The homepage will use a bold editorial style inspired by the supplied reference:

- Oversized condensed `RACHEL KENNEDY` typography
- Overlapping travel photographs with subtle rotation
- Bright pill-shaped labels for short supporting text
- A minimal navigation and generous open space
- Responsive layouts that preserve the layered composition on smaller screens

The design will take inspiration from the reference without copying its branding or exact composition.

## Planned stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase database, authentication, and image storage
- Vercel deployment

## Version 1

### Public website

- Responsive editorial homepage
- Most recent trip and an all-trips grid on the homepage
- Individual travel-story pages
- Photo galleries
- Location and travel-date information
- About page
- SEO metadata, canonical URLs, sitemap, robots, and social sharing previews

### Admin CMS

- Protected admin sign-in
- Create and edit travel posts
- Rich-text post editor
- Upload a cover image and gallery photos
- Enter a location, country, and travel dates
- Save drafts
- Publish and unpublish posts
- Edit or delete existing posts

### Deferred after launch

- Likes
- Comments and moderation tools

## Data model

### Posts

Each post will include:

- Title
- Slug
- Excerpt
- Rich-text content
- Cover image
- Location and country
- Travel start and end dates
- Publication status
- Created, updated, and published timestamps

Rich-text post content is stored as Tiptap/ProseMirror JSON with a root object shaped like:

```json
{
  "type": "doc",
  "content": []
}
```

When rendered in the UI, rich-text output must be sanitized before display.

### Post images

Gallery images will include a post reference, image URL, alt text, caption, and display order.

### Deferred features

Likes and moderated comments are outside the initial launch scope. Their supporting database objects remain available for a possible future implementation, but they are not exposed in the public site or admin CMS.

## Environment variables

Set these variables in both local `.env.local` (for development) and Vercel project settings (for production):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

If you later add server-only workflows (cron jobs, admin scripts, or webhooks), keep any service role key private and never expose it through `NEXT_PUBLIC_*`.

## Supabase setup

1. Create a Supabase project and copy the project URL and publishable key into `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Apply the SQL migration in `/supabase/migrations/20260902173500_add_content_foundation.sql`.

   The migration creates:

   - `admin_users`, `posts`, `post_images`, `post_likes`, and `comments`
   - Row Level Security policies for public readers, comment creation, and admin-only content management
   - An `approved_comments` view that exposes approved comment text without private email addresses
   - A public `post_like_totals` view so browsers can read aggregate likes without seeing visitor hashes
   - A public `post-images` storage bucket with admin-only uploads, updates, and deletes

3. Add the first admin safely after that person has signed in once with Supabase Auth so their `auth.users.id` already exists:

   ```sql
   insert into public.admin_users (user_id)
   values ('<existing-auth-user-uuid>');
   ```

   Run that statement only from a trusted server-side context such as the Supabase SQL editor or another privileged backend workflow.

4. The application Supabase helpers live in:

   - `/lib/supabase/env.ts` for typed runtime environment validation
   - `/lib/supabase/client.ts` for browser usage
   - `/lib/supabase/server.ts` for server-side SSR usage
   - `/types/supabase.ts` for database types

## Vercel launch

1. Import the repository into Vercel.
2. Add the environment variables listed above (without changing their names).
3. Deploy and confirm:
   - `/robots.txt` returns disallow rules for `/admin`
   - `/sitemap.xml` includes the published public routes
4. Connect the custom domain in Vercel and ensure `NEXT_PUBLIC_SITE_URL` matches the final `https://` domain.

## Local setup

When there are no published Supabase posts, local development and Vercel preview deployments show sample trips so the public layouts can be reviewed. Production never uses this sample content.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` to view the site.

5. Lint and build before launch:

   ```bash
   npm run lint
   npm run build
   ```

## Launch checklist

- [ ] Supabase migration has been applied.
- [ ] `post-images` storage bucket exists and upload policies are in place.
- [ ] At least one admin account has signed in and been inserted into `public.admin_users`.
- [ ] Vercel environment variables are configured with production values.
- [ ] Production deployment succeeds and public routes render.
- [ ] `robots.txt` and `sitemap.xml` are reachable in production.
- [ ] Custom domain is connected and `NEXT_PUBLIC_SITE_URL` matches it.
- [ ] Draft posts are not publicly visible, and `/admin` is not indexed.
- [ ] Final content and metadata review is complete for all published trips.
