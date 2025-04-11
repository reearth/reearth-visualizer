import config from "eslint-config-reearth";

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
  { ignores: ["bin/pluginDoc.ts"] }
];
