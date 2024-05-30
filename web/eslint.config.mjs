import config, { commonjs } from "eslint-config-reearth";
import playwright from "eslint-plugin-playwright";
import globals from "globals";

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  ...config,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lodash",
              message: "Use lodash-es instead.",
            },
          ],
        },
      ],
      "import/order": [
        "warn",
        {
          pathGroups: [
            {
              pattern: "@reearth/**",
              group: "external",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["e2e/**/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@playwright/test",
              message: "Use @reearth/e2e/utils instead.",
            },
          ],
        },
      ],
    },
  },
  {
    ...commonjs[0],
    files: ["i18next-parser.config.js"],
  },
  {
    files: ["src/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/consistent-type-definitions": ["warn"],
    },
  },
  {
    ignores: [
      "/build",
      "/dist",
      "/coverage",
      "storybook-static",
      "!/.storybook",
      "/.storybook/public",
      "/src/classic/gql/graphql-client-api.tsx",
      "/src/services/gql/__gen__",
      "/node_modules",
    ],
  },
];
