import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    globalSetup: "./tests/clearDB.js",
    testTimeout: 2000
  },
})