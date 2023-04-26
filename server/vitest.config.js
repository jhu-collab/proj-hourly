import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    globalSetup: "./tests/clearDB.js",
    singleThread: true,
    outputFile: './tests/results.html'
  },
})