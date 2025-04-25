import { mergeConfig } from "vite";
import { defineConfig, configDefaults } from "vitest/config";

import viteConfig from "./vite.config";

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
          "src/beta/services/gql/__gen__/**/*",
          "src/test/**/*",
          "src/**/*.test.{ts,tsx}"
        ],
        reporter: ["text", "json", "lcov"]
      }
    }
  })
);
