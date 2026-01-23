import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
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
      },
      projects: [
        {
          extends: true,
          test: {
            environment: "jsdom",
            setupFiles: "src/test/setup.ts",
            include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
          }
        }
      ]
    }
  })
);
