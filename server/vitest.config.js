import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
      reportsDirectory: "./tests/unit/coverage",
    },
    globalSetup: "./tests/clearDB.js",
    testTimeout: 2000,
    threads: false,
  },
});
