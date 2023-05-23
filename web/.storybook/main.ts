import { resolve } from "path";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";


const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|ts|tsx|mdx)"],
  addons: [
    {
      name: "@storybook/addon-essentials",
    },
  ],
  framework: "@storybook/react-vite",
  core: {
    builder: "@storybook/builder-vite",
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
        // WORKAROUND: https://github.com/storybookjs/builder-vite/issues/255
        dedupe: ["@storybook/client-api"],
      },
    });
  },
};

module.exports = config;
