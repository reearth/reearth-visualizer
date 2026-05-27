// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import config from "eslint-config-reearth";
import storybook from "eslint-plugin-storybook";

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

export default [
  ...config("@reearth"),
  ...themeConfig,
  {
    ignores: ["bin/pluginDoc.ts"]
  },
  ...storybook.configs["flat/recommended"]
];
