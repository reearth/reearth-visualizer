import config from "eslint-config-reearth";
import playwright from "eslint-plugin-playwright";

/** @type { import("eslint").Linter.Config[] } */

const customVisualizerConfig = [
  {
    rules: {},
  },
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
              message: "Use @reearth/e2e/utils instead.",
            },
          ],
        },
      ],
    },
  },
];

export default [...config("@reearth"), ...e2eConfig, ...customVisualizerConfig];
