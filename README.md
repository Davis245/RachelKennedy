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
- Featured journey and recent travel posts
- Browse posts by location
- Individual travel-story pages
- Photo galleries
- Location and travel-date information
- About page
- Likes
- Moderated comments
- Basic SEO and social-sharing metadata

### Admin CMS

- Protected admin sign-in
- Create and edit travel posts
- Rich-text post editor
- Upload a cover image and gallery photos
- Enter a location, country, and travel dates
- Save drafts
- Publish and unpublish posts
- Review, approve, and remove comments
- Edit or delete existing posts

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

### Likes

Likes will use an anonymous visitor identifier so readers can like a post without creating an account while limiting repeat likes from the same browser.

### Comments

Comments will include a display name, optional private email address, comment text, moderation status, and creation date. New comments will remain hidden until approved by the administrator.

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

4. Keep any future `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not expose it to browser code or `NEXT_PUBLIC_*` variables.

5. The application Supabase helpers live in:

   - `/lib/supabase/env.ts` for typed runtime environment validation
   - `/lib/supabase/client.ts` for browser usage
   - `/lib/supabase/server.ts` for server-side SSR usage
   - `/types/supabase.ts` for database types

## Status

Requirements and visual direction are defined. The initial Next.js scaffold is in place and ready for local development.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file if you need local environment variables later:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` to view the site.

5. Create a production build locally when needed:

   ```bash
   npm run build
   ```
