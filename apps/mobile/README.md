# CourtRank Mobile (`@courtrank/mobile`)

React Native (Expo SDK 54, Expo Router) player app. Talks to the same backend as
the web app and shares its logic through `@courtrank/core`. Auth is Clerk
(`@clerk/clerk-expo`, secure-store token cache); data is TanStack Query; styling is
NativeWind.

## Local development

Requires a **development build** (not Expo Go) because Clerk + secure-store use
native modules.

1. Copy env: `cp .env.example .env` and fill in:
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — the same `pk_test_…` used by the web app.
   - `EXPO_PUBLIC_API_BASE_URL` — the backend. On a physical device use your machine's
     LAN IP (e.g. `http://192.168.1.x:8080`) or an Expo tunnel, **not** `localhost`.
2. From the repo root: `pnpm mobile` (or `pnpm --filter @courtrank/mobile start`).
3. Build a dev client once, then reuse it:
   `pnpm --filter @courtrank/mobile exec eas build --profile development`
   (simulator: `--profile development-simulator`).
4. Sign in with a seeded account (see `.claude/rules/local-testing.md`) via
   email/password.

## Notes

- The pnpm workspace uses `nodeLinker: hoisted` (in `pnpm-workspace.yaml`) so Metro
  can resolve RN transitive deps.
- `@courtrank/core` is imported via its **barrel** (`@courtrank/core`); config is
  injected at startup in `app/_layout.tsx` (`setApiConfig` / `setMutationNotifier`).

## Deploy (EAS) — one-time setup

Independent of the web (Vercel) pipeline. Requires an Expo account.

1. `pnpm --filter @courtrank/mobile exec eas login`
2. `pnpm --filter @courtrank/mobile exec eas init` — creates the EAS project and fills
   `expo.extra.eas.projectId` + `expo.updates.url` in `app.json`.
3. `pnpm --filter @courtrank/mobile exec eas env:create` (or the EAS dashboard) to set
   `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` for the `preview` and `production` environments.
   (`EXPO_PUBLIC_API_BASE_URL` is already in `eas.json` per profile.)
4. Builds/updates:
   - Preview build against prod backend: `eas build --profile preview`
   - JS-only OTA: `eas update --channel production`
   - The `.eas/workflows/deploy-to-production.yml` workflow fingerprints the native
     project on push to `main` and either OTA-updates (JS-only) or rebuilds + submits
     (native changed). Run it with `eas workflow:run deploy-to-production.yml`.
