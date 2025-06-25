import { configDefaults, defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

// This file is required by VSCode's Vitest extension.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: "src/test/setup.ts",
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      exclude: [...configDefaults.exclude, "e2e/*"],
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.d.ts",
          "src/**/*.cy.tsx",
          "src/**/*.stories.tsx",
          "src/app/services/gql/__gen__/**/*",
          "src/test/**/*",
          "src/**/*.test.{ts,tsx}"
        ],
        reporter: ["text", "json", "lcov"]
      }
    }
  })
);
