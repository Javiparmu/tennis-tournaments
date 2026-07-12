## Mobile Workspace Rules

This workspace is `@courtrank/mobile`, the Expo SDK 54 React Native player app.

- Mobile v1 is player-first: browse tournaments, tournament detail/bracket/standings, join/withdraw, ranking, own profile, calendar, trainings, rackets, and stringing. Host and admin flows remain web-only.
- Use Expo Router file-based routes under `app/`. Public player/tournament screens should remain deep-linkable; auth-gated owner tools live behind Clerk session checks.
- Use `@clerk/clerk-expo` and the secure-store token cache. Do not use `@clerk/nextjs` here.
- Use `@courtrank/core` for shared models, API calls, labels, surface constants, score/standings/search/date helpers, query keys, and optimistic helpers. Keep query hooks in `apps/mobile/data/queries` because they depend on Clerk Expo.
- `app/_layout.tsx` must import `lib/core-init` before queries can fire, and must wire `setMutationNotifier` to the mobile toast channel.
- `EXPO_PUBLIC_API_BASE_URL` must point at a reachable backend. On a physical device use a LAN IP or tunnel, not `localhost`.
- Use the hand-rolled NativeWind component kit in `components/ui` (`Screen`, `Card`, `Button`, `Hero`, `FormError`, `EmptyState`, `Skeleton`, `Sheet`, `Toast`) before creating new primitives.
- Use `lucide-react-native` for icons and `react-native-svg` for charts/brackets. Do not import web components, HeroUI, Next APIs, DOM APIs, or Tailwind web-only class helpers.
- React version skew is intentional: Expo uses React 19.1 while web may use a different React version. Do not hoist React to root or add React as a dependency of `@courtrank/core`.
- EAS builds and updates are independent from Vercel. Build profiles live in `eas.json`; `preview` and `production` target the production backend unless intentionally changed.

Useful commands from the repo root:

- `pnpm mobile`
- `pnpm --filter @courtrank/mobile start`
- `pnpm --filter @courtrank/mobile test`
- `pnpm --filter @courtrank/mobile exec eas build --profile development-simulator`
