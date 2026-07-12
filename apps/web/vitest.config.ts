import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pure-node unit tests (no jsdom / testing-library). Resolve the `@/` alias to
// the repo root so it matches the `paths` mapping in tsconfig.json.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    environment: "node",
  },
});
