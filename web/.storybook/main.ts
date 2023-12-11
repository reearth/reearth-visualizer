import { resolve } from "path";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-styling"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  staticDirs: ["./public"],
  viteFinal(config, { configType }) {
    return mergeConfig(config, {
      define: {
        "process.env.QTS_DEBUG": "false", // quickjs-emscripten
      },

      build:
        configType === "PRODUCTION"
          ? {
              // https://github.com/storybookjs/builder-vite/issues/409
              minify: false,
              sourcemap: false,
            }
          : {},
      resolve: {
        alias: [
          {
            find: "crypto",
            replacement: "crypto-js",
          },
          // quickjs-emscripten
          {
            find: "@reearth",
            replacement: resolve(__dirname, "..", "src"),
          },
          {
            find: "csv-parse",
            replacement: "csv-parse/browser/esm",
          },
        ],
      },
      server: {
        watch: {
          // https://github.com/storybookjs/storybook/issues/22253#issuecomment-1673229400
          ignored: ["**/.env"],
        },
      },
    });
  },
  docs: {
    autodocs: true,
  },
};
module.exports = config;
