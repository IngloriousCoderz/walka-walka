import { defineConfig, mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

// The app's Vite config, so tests compile the code as the app does, with two
// projects: unit tests, which need nothing running, and integration tests,
// which talk to a real backend.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      setupFiles: ["src/testing/setup.ts"],
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            include: ["src/**/*.test.ts"],
            exclude: ["src/**/*.integration.test.ts"],
            // Unit tests never reach the backend: a placeholder address lets
            // them create the Supabase client without .env.local, as in CI.
            env: {
              VITE_SUPABASE_URL: "http://127.0.0.1:54321",
              VITE_SUPABASE_ANON_KEY: "unit-tests",
            },
          },
        },
        {
          extends: true,
          test: {
            name: "integration",
            include: ["src/**/*.integration.test.ts"],
            testTimeout: 30_000,
          },
        },
      ],
    },
  }),
)
