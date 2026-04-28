# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server on localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured.

## Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_MAPBOX_TOKEN
```

## Architecture

**SK8 Tepeji** is a skateboarding community app for Tepeji del Río, México. Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui components, Supabase (Postgres + Storage), Clerk (auth), Mapbox GL (maps).

### Auth & user sync

Clerk handles authentication. When a user signs up, Clerk fires a webhook to `/api/webhooks/clerk/route.ts` which creates a row in Supabase `profiles`. User IDs are Clerk-format strings (`user_xxx`), so `profiles.id` is `text`, not UUID.

Admin access is determined by `profiles.role = 'admin'`. The admin check reads from Supabase directly — there is no Clerk role/metadata involved.

### Two Supabase clients

- `src/lib/supabase.ts` — anon key, used in client components for public reads
- `src/lib/supabase-server.ts` — service role key, used in Server Components and API routes for all writes

All mutations (insert/update/delete) go through API routes or Server Components using the service role client. The Supabase RLS allows public reads; writes are intentionally blocked for the anon key.

### Routing / middleware

Next.js 16 uses `src/proxy.ts` instead of `middleware.ts`. The proxy gates non-public routes with Clerk's `auth.protect()`. Public routes: `/`, `/spots/*`, `/rankings/*`, `/skaters/*`, `/sign-in/*`, `/sign-up/*`, `/api/webhooks/*`.

### Votes

Trick votes toggle: one vote per user per trick, enforced by a `unique(trick_id, user_id)` constraint. Vote counts are updated atomically via Supabase RPC functions `increment_vote_count` and `decrement_vote_count`. The `/api/votes` route handles toggle logic and returns the new count.

### Map

`MapComponent` uses Mapbox GL and is always loaded with `dynamic(..., { ssr: false })` because it requires the browser DOM. It defaults to Tepeji del Río coordinates (`[-99.34479, 19.90481]`). The map re-uses a single instance and swaps the style when the theme changes (no re-initialization).

### Navigation layout

Three responsive breakpoints in `src/components/navigation.tsx`:
- **Mobile (<768px)**: fixed top bar + bottom tab bar with FAB
- **Tablet (768–1279px)**: fixed top navbar
- **Desktop (≥1280px)**: fixed left sidebar (60px wide offset applied to `<main>` via `lg:pl-60`)

The main content area has `pb-20 pt-12 md:pb-0 md:pt-16 lg:pt-0 lg:pl-60` for correct spacing at all breakpoints.

### Database schema

Tables: `profiles`, `spots`, `spot_photos`, `tricks`, `votes`. Migrations live in `supabase/migrations/`. Storage buckets: `spot-photos`, `trick-photos`, `trick-videos` (all public).
