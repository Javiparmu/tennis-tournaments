<!-- BEGIN:project-rules -->
## What this project is

A web app for **discovering upcoming tennis tournaments** and **registering to play** in them.

**Players:** browse listings, sign up for events, and get a **gamified experience**: an **Elo-style rating** that reflects how you place in tournaments, plus a **player profile** with score, **achievements**, and **practical tools** for people who play tennis.

**Hosts (clubs):** tournament organizers use a **club account** to **create and manage tournaments** so registered users can join. Club accounts are **provisioned manually by the platform operator** (a platform admin creates the club via the backend API) — there is **no self-service club creation** in the app; club-facing CTAs point to the contact mailto in `lib/contact.ts`.

## Manual testing (local)

- Backend lives in the sibling repo `../TennisTournamentBackend`. Run it with `./run-local.ps1` (seeds an in-memory H2 DB); this frontend's `.env.local` already points `NEXT_PUBLIC_API_BASE_URL` at `http://localhost:8080`.
- Two seeded, claimable test accounts (sign in with email + password via Clerk; full guide in `../TennisTournamentBackend/docs/MANUAL_TESTING.md`):
  - `club+clerk_test@example.com` — owns "Seed Tennis Club": `/host`, tournament lifecycle, join-request accept/reject.
  - `admin+clerk_test@example.com` — `PLATFORM_ADMIN`: `/admin` (URL-only, not in the nav) to review club contact requests and provision clubs.
- The seed creates these users with `auth_subject = NULL`; the backend claims the row on first Clerk sign-in with the matching email, so they survive H2 resets with no manual relinking.

## Stack and references

- **Framework:** [Next.js](https://nextjs.org/docs) — use the in-repo docs under `node_modules/next/dist/docs/` when implementing (this project’s Next version may differ from older training cutoffs).
- **UI:** [HeroUI](https://www.heroui.com/) React — follow the HeroUI block below and `./.heroui-docs/react` for components and patterns.
- **Auth:** [Clerk](https://clerk.com/docs) — use the Clerk agent skills under `.agents/skills/clerk*` (e.g. `clerk-setup`, `clerk-nextjs-patterns`, orgs, webhooks) for sign-in, middleware, and backend integration as needed.

## Layout consistency (rule)

- Every top-level page `<main>` uses the same frame: `mx-auto w-full max-w-6xl px-6 py-10` (add `flex-1` when the page is a flex column). This matches the `SiteHeader` container (`max-w-6xl`) so content edges line up across tabs. Do not introduce other page widths (`max-w-3xl/4xl/5xl`) for the outer frame — narrow inner sections may still cap their own width.
- `html` sets `overflow-y: scroll` (plus `scrollbar-gutter: stable`) in `app/globals.css` so the vertical scrollbar is always present. Keep it — it stops the centered header/page frame from shifting horizontally when navigating between short pages (no scroll) and tall pages (scroll). `scrollbar-gutter` alone is not enough here because `<html>` has `h-full`.
- No layout shift from async UI: components that appear after auth/data resolves (Clerk `useUser`, React Query) must reserve their space from first paint — render the container/shell at its final height with a skeleton inside, never `return null` and pop in later. Popping in shifts content under the cursor and breaks hover states (see `RankingCta` in `app/profile/page.tsx`).
<!-- END:project-rules --> 

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
