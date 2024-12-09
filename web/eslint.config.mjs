import config from "eslint-config-reearth";
import playwright from "eslint-plugin-playwright";

/** @type { import("eslint").Linter.Config[] } */

const themeConfig = [
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends"
        }
      ]
    }
  }
];

const e2eConfig = [
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
              message: "Use @reearth/e2e/utils instead."
            }
          ]
        }
      ]
    }
  }
];

export default [
  ...config("@reearth"),
  ...e2eConfig,
  ...themeConfig,
  { ignores: ["bin/pluginDoc.ts"] }
];
