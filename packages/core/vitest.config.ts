import { defineConfig } from "vitest/config";

// Pure-node unit tests for the shared core (no jsdom). Tests import their modules
// relatively, so no path alias is needed.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
