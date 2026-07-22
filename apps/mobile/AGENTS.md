## Mobile Workspace Rules

This workspace is `@courtrank/mobile`, the Expo SDK 54 React Native player app.

- Mobile v1 is player-first: browse tournaments, tournament detail/bracket/standings, join/withdraw, ranking, own profile, calendar, trainings, rackets, and stringing. Platform-admin tools (the `/admin` console — overview, club contact-request review/provisioning, clubs directory) are also available on mobile behind a `PLATFORM_ADMIN` gate reached from the Perfil tab. The host/club-owner surface (request a club, edit club details, add/remove admins) is now on mobile too, reached from the Perfil tab's host entry; **tournament creation stays web-only** for now (the mobile club screen lists tournaments read-only).
- The admin surface mirrors web's data layer: mobile query hooks in `data/queries/admin.ts` wrap the shared `@courtrank/core` admin API (no new core code), the screen lives at `app/admin.tsx`, and provisioning uses `components/admin/provision-club-sheet.tsx`. Role gating is UI-only; the backend authorizes every admin call.
- The host surface mirrors the same shape: mobile hooks in `data/queries/clubs.ts` wrap the shared `@courtrank/core` club API (no new core code), screens live at `app/host.tsx` and `app/club/[id].tsx`, and the sheets are `components/club/{club-contact,club-form,add-admin}-sheet.tsx`. `useCanManageClub` (in `data/queries/clubs.ts`) is a UI-only gate off `managedClubIds`; admins are added by `@username` resolved client-side (there is no email-add for club admins).
- Use Expo Router file-based routes under `app/`. Public player/tournament screens should remain deep-linkable; auth-gated owner tools live behind Clerk session checks.
- Use `@clerk/clerk-expo` and the secure-store token cache. Do not use `@clerk/nextjs` here.
- Use `@courtrank/core` for shared models, API calls, labels, surface constants, score/standings/search/date helpers, query keys, and optimistic helpers. Keep query hooks in `apps/mobile/data/queries` because they depend on Clerk Expo.
- `app/_layout.tsx` must import `lib/core-init` before queries can fire, and must wire `setMutationNotifier` to the mobile toast channel.
- `EXPO_PUBLIC_API_BASE_URL` must point at a reachable backend. On a physical device use a LAN IP or tunnel, not `localhost`.
- Use the hand-rolled NativeWind component kit in `components/ui` (`Screen`, `Card`, `Button`, `Hero`, `FormError`, `EmptyState`, `Skeleton`, `Sheet`, `SegmentedTabs`, `Chip`, `Stat`, `Avatar`, `Sparkline`, `TabBar`, `Toast`) before creating new primitives.
- **Mobile is dark-first and does not mirror the web app's chrome.** One theme, no `dark:` variants, and no light/dark branch on any component — the old `dark` / `night` / `limeDark` / `tone="dark"` props are deleted, not to be reintroduced. Colours come from `theme/tokens.ts` + `tailwind.config.js`, which mirror each other and must change together: canvas → surface → surface-2 is the elevation ladder (depth is lightness plus the hairline `line` border, never a shadow — shadows are invisible on near-black), `ink`/`ink-muted`/`ink-faint` is the text ramp, and `lime` is the single loud accent.
- Semantic tones (`danger`, `live`, `info`) are picked for the dark canvas; do not swap in Tailwind's default light-theme scales (rose-600, blue-600) — they go muddy. For court surfaces use `surfaceColor()` from `theme/tokens.ts`, not core's `SURFACE_HEX` directly: that hex is shared with web and tuned for white.
- NativeWind silently drops `className` — with no type error — on `LinearGradient`, `Animated.*`, `expo-image`, gorhom components, and `Link`. `tsc` will not catch a dead class either, so after a token rename grep for the old name. Style those components through `style`, or register an interop like `field.tsx` does.
- The tab bar floats over the scroll content. Screens under `(tabs)` pass `<Screen tabBar>` for clearance; stack screens must not. The bar's geometry lives in `components/ui/tab-bar.tsx` and `Screen`/`Toast` derive their offsets from it — never hardcode the number.
- Use `lucide-react-native` for icons and `react-native-svg` for charts/brackets. Do not import web components, HeroUI, Next APIs, DOM APIs, or Tailwind web-only class helpers.
- React version skew is intentional: Expo uses React 19.1 while web may use a different React version. Do not hoist React to root or add React as a dependency of `@courtrank/core`.
- EAS builds and updates are independent from Vercel. Build profiles live in `eas.json`; `preview` and `production` target the production backend unless intentionally changed.

Useful commands from the repo root:

- `pnpm mobile`
- `pnpm --filter @courtrank/mobile start`
- `pnpm --filter @courtrank/mobile test`
- `pnpm --filter @courtrank/mobile exec eas build --profile development-simulator`
