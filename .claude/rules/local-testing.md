# Local & manual testing

## Backend contract (portable)

The apps talk to a separate backend service, a companion Spring project whose location on disk varies per machine. Nothing here hardcodes a path. The apps only need the backend base URL:

- Web: `apps/web/.env.local` sets `NEXT_PUBLIC_API_BASE_URL` (local default: `http://localhost:8080`).
- Mobile: `apps/mobile/.env` sets `EXPO_PUBLIC_API_BASE_URL`. On a physical device, use the machine's LAN IP or an Expo tunnel, not `localhost`.

The backend authorizes every mutation server-side. Client-side role/permission gating is UI-only; never treat it as a security boundary. Run the backend and consult its seed/testing details from that project's own README/docs.

## Seeded test accounts

The backend seed provisions these claimable accounts. Sign in with email + password via Clerk. They are stable seed data and safe to reference:

| Account | Role | Reaches |
| --- | --- | --- |
| `club+clerk_test@example.com` / `CourtRankClub123!` | Club owner ("Seed Tennis Club") | `/host` - tournament lifecycle, join-request accept/reject |
| `admin+clerk_test@example.com` / `CourtRankAdmin123!` | `PLATFORM_ADMIN` | `/admin` - review club contact requests, provision clubs |

The seed creates these users with `auth_subject = NULL`; the backend claims the row on first Clerk sign-in with the matching email, so they survive DB resets with no manual relinking.

Use the same Clerk email/password accounts in the mobile development build when testing player flows. The mobile app is player-first; **host/club owner screens remain web-only**, but the `PLATFORM_ADMIN` admin console is now available on mobile too (reached from the Perfil tab). Sign in with the admin account to test it.

## Admin access

`/admin` is URL-only in the web app, not in the nav. Reach it by navigating directly. It is middleware-protected (`apps/web/proxy.ts`) so anonymous visitors are redirected to sign-in; the `PLATFORM_ADMIN` role check happens client-side and server-side.

Admins provision club accounts here. There is no self-service club creation in the app; club-facing CTAs point to the contact mailto in `packages/core/src/lib/contact.ts`.

## Web smoke checklist after auth/data changes

- Incognito `/admin` and `/host` -> redirected to sign-in; `/tournaments` and `/players/[id]` stay public.
- Modals open/close/submit; no layout shift when auth/data resolves.
- Two pending join requests -> accept one, the other row's buttons stay enabled.
- `view-source` on `/tournaments/[id]` shows the tournament name in `<title>`.

Run from the repo root:

- `pnpm --filter @courtrank/web build`
- `pnpm --filter @courtrank/web test`

## Mobile smoke checklist after auth/data changes

- Use a development build, not Expo Go.
- Start with `pnpm mobile` or `pnpm --filter @courtrank/mobile start`.
- Sign in with a seeded player-capable account via email/password; smoke one configured social provider when auth flows changed.
- Browse tournaments -> open detail -> bracket/standings render -> submit a join request -> see pending status -> withdraw.
- Open a player profile. Own profile should show rating/achievements and allow training/racket/stringing flows where implemented.
- As a `PLATFORM_ADMIN`, the Perfil tab shows a shield entry into `/admin`; a normal player does not. Open it -> overview/requests/clubs render -> provision a club from a pending request (row clears + toast) -> delete a request.
- Kill and reopen the app; the Clerk session should persist via secure-store token cache.

Run from the repo root:

- `pnpm --filter @courtrank/mobile test`
