import config from "eslint-config-reearth";
import playwright from "eslint-plugin-playwright";

/** @type { import("eslint").Linter.Config[] } */
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
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "node/no-extraneous-import": "off",
      "node/no-unsupported-features/es-syntax": [
        "error",
        {
          ignores: ["dynamicImport", "modules"],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["e2e/**/*"],
    ...playwright.configs["flat/recommended"],
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
    ignores: [
      "node_modules",
      "dist",
      ".yarn",
      "storybook-static",
      "!/.storybook",
      ".storybook/public",
      "src/services/gql/__gen__",
    ],
  },
];
