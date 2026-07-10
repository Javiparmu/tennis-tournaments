# Local & manual testing

## Backend contract (portable)

The frontend talks to a separate backend service (a companion Spring project — its location on disk varies per machine, so nothing here hardcodes a path). The **only** thing this app needs to know is the base URL:

- `NEXT_PUBLIC_API_BASE_URL` — set in `.env.local` (local default: `http://localhost:8080`). Point it at wherever your backend is running.

The backend authorizes **every** mutation server-side. Client-side role/permission gating is UI-only; never treat it as a security boundary. Run the backend and consult its seed/testing details from that project's own README/docs.

## Seeded test accounts

The backend seed provisions these claimable accounts (sign in with email + password via Clerk). They are stable seed data, safe to reference:

| Account | Role | Reaches |
| --- | --- | --- |
| `club+clerk_test@example.com` / `CourtRankClub123!` | Club owner ("Seed Tennis Club") | `/host` — tournament lifecycle, join-request accept/reject |
| `admin+clerk_test@example.com` / `CourtRankAdmin123!` | `PLATFORM_ADMIN` | `/admin` — review club contact requests, provision clubs |

The seed creates these users with `auth_subject = NULL`; the backend claims the row on first Clerk sign-in with the matching email, so they survive DB resets with no manual relinking.

## Admin access

`/admin` is **URL-only** — not in the nav. Reach it by navigating directly. It is middleware-protected (`proxy.ts`) so anonymous visitors are redirected to sign-in; the `PLATFORM_ADMIN` role check happens client-side and server-side (role comes from `/users/me`, not session claims).

Admins provision club accounts here. There is **no self-service club creation** in the app — club-facing CTAs point to the contact mailto in `lib/contact.ts`.

## Smoke checklist after auth/data changes

- Incognito `/admin` and `/host` → redirected to sign-in; `/tournaments` and `/players/[id]` stay public.
- Modals open/close/submit; no layout shift when auth/data resolves.
- Two pending join requests → accept one, the other row's buttons stay enabled.
- `view-source` on `/tournaments/[id]` shows the tournament name in `<title>`.
