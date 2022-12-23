import { resolve } from "path";

import yaml from "@rollup/plugin-yaml";
import type { StorybookViteConfig } from "@storybook/builder-vite";
import { mergeConfig } from "vite";
import cesium from "vite-plugin-cesium";

const config: StorybookViteConfig = {
  stories: ["../src/**/*.stories.@(js|ts|tsx|mdx)"],
  addons: [
    {
      name: "@storybook/addon-essentials",
    },
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-vite",
    disableTelemetry: true,
  },
  staticDirs: ["./public"],
  viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins: [yaml(), cesium()],
      define: {
        "process.env.QTS_DEBUG": "false", // quickjs-emscripten
      },
      build:
        configType === "PRODUCTION"
          ? {
              // https://github.com/storybookjs/builder-vite/issues /409
              minify: false,
              sourcemap: false,
            }
          : {},
      resolve: {
        alias: [
          { find: "crypto", replacement: "crypto-js" }, // quickjs-emscripten
          { find: "@reearth", replacement: resolve(__dirname, "..", "src") },
          { find: "csv-parse", replacement: "csv-parse/browser/esm" },
        ],
      },
    });
  },
};

module.exports = config;
