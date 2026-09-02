# Repository instructions for Copilot

## Preserve the approved landing-page design

The public homepage hero has been deliberately designed and approved. Do not modify its appearance or behavior while working on unrelated issues.

Unless the issue explicitly requests a homepage or hero change, do not modify:

- `app/page.tsx`
- `app/layout.tsx`
- hero-related rules in `app/globals.css`
- `components/site-hero.tsx`
- `components/site-header.tsx`
- `components/scroll-indicator.tsx`
- the homepage hero images or font files

The hero title must continue using `Dancing_Script` from `next/font/google`, weight `700`, through the `--font-hero-display` CSS variable. Preserve the existing full-width text/photo composition, overlap, stacking order, responsive behavior, scroll-triggered navigation, and scroll-indicator behavior.

If an infrastructure change genuinely requires editing `app/layout.tsx`, preserve all existing font imports, font variables, body classes, site header, site footer, and public layout behavior. Make only the smallest required change.

Before finishing any task:

1. Review the complete diff against the task's base branch.
2. Remove changes to the protected landing-page files unless the issue explicitly requested them.
3. Run `npm run lint` and `npm run build`.
4. State in the pull-request summary whether any protected landing-page file changed and why.

Do not replace existing design choices with starter styles, placeholder content, alternate fonts, or broad layout rewrites.
