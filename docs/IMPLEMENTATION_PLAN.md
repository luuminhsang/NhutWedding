# Implementation plan

## Completed foundation

- Next.js TypeScript project, Romantic Classic design tokens, mobile-first public invitation and accessible interaction states.
- Supabase schema, RLS baseline, allowlisted admin route, RSVP and guestbook server endpoints.
- Deployment, environment, security, database and admin documentation.

## Configuration-dependent completion

1. Create Supabase project, apply migration and create private `wedding-media` bucket/policies.
2. Add real couple content, family names, events, confirmed venues and original photographs through admin tooling.
3. Complete CRUD screens for content/events/media/RSVP moderation and publish snapshot workflow.
4. Connect canonical URL to QR exports and validate on a mobile device.
5. Deploy to Vercel, then complete Playwright, RLS and responsive test matrix.
