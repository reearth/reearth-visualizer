import yaml from "@rollup/plugin-yaml";
import { PluginOption } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig, configDefaults } from "vitest/config";

export default mergeConfig(
  {
    plugins: [svgr(), tsconfigPaths(), yaml() as PluginOption],
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
      },
      alias: [
        { find: "crypto", replacement: "crypto" }, // reset setting for quickjs-emscripten
        { find: "csv-parse", replacement: "csv-parse" },
        { find: "@reearth/test/utils", replacement: "src/test/utils" },
        {
          find: "@reearth/services/theme/reearthTheme/common/spacing",
          replacement: "src/services/theme/reearthTheme/common/spacing"
        }
      ]
    }
  },
  defineConfig({})
);
