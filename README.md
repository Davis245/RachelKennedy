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

### Post images

Gallery images will include a post reference, image URL, alt text, caption, and display order.

### Likes

Likes will use an anonymous visitor identifier so readers can like a post without creating an account while limiting repeat likes from the same browser.

### Comments

Comments will include a display name, optional private email address, comment text, moderation status, and creation date. New comments will remain hidden until approved by the administrator.

## Status

Requirements and visual direction are defined. Project scaffolding and implementation are next.
