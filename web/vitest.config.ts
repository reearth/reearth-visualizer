import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    exclude: [...configDefaults.exclude, "e2e/*"],
    coverage: {
      all: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.cy.tsx",
        "src/**/*.stories.tsx",
        "src/services/gql/graphql-client-api.tsx",
        "src/test/**/*",
      ],
      reporter: ["text", "json", "lcov"],
    },
    alias: [
      { find: "crypto", replacement: "crypto" }, // reset setting for quickjs-emscripten
      { find: "csv-parse", replacement: "csv-parse" },
    ],
  },
});
