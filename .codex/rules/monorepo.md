# CourtRank Codex rules

Use this alongside the nearest `AGENTS.md`.

## CodeGraph first

For structural questions, call-flow analysis, dependency/reference checks, impact analysis, and "how does X work" work, resolve the repo root and use CodeGraph before broad filesystem searches. If `.codegraph/` is missing in a real project root and CodeGraph is available, initialize it once with `gentle-ai codegraph init --cwd <project-root>`.

## Workspace boundaries

- `apps/web`: Next.js 16 web app. Web routes, HeroUI, Tailwind, Clerk Next, host/admin screens, and web query hooks stay here.
- `apps/mobile`: Expo SDK 54 player app. React Native UI, NativeWind, Clerk Expo, Expo Router, EAS config, and mobile query hooks stay here.
- `packages/core`: shared portable TypeScript. Models, pure helpers, API modules, query keys, labels, and optimistic helpers stay here. No React, Next, Expo, Clerk, HeroUI, NativeWind, or app aliases.

## Command defaults

Run from the repo root unless scoped otherwise:

- Web dev: `pnpm dev`
- Mobile dev: `pnpm mobile`
- Web build: `pnpm --filter @courtrank/web build`
- Mobile typecheck: `pnpm --filter @courtrank/mobile test`
- Shared tests: `pnpm --filter @courtrank/core test`
- Full tests: `pnpm test`
- Lint/format: `pnpm lint`, `pnpm check`, `pnpm format`

## Editing posture

Prefer moving shared logic into `@courtrank/core` instead of duplicating it between web and mobile. Keep app-specific auth, UI, runtime config, and platform styling in the app workspace. Do not import web code into mobile or mobile code into web.
