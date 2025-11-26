import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  core: {
    disableTelemetry: true
  },
  staticDirs: ["./public"],
  viteFinal(config, { configType }) {
    return mergeConfig(config, {
      define: {
        "process.env.QTS_DEBUG": "false" // quickjs-emscripten
      },
      build:
        configType === "PRODUCTION"
          ? {
              // https://github.com/storybookjs/builder-vite/issues/409
              minify: false,
              sourcemap: false
            }
          : {},
      resolve: {
        alias: [
          {
            find: "crypto",
            replacement: "crypto-js"
          },
          {
            find: "@reearth/core",
            replacement: resolve(__dirname, "..", "node_modules/@reearth/core")
          },
          {
            find: "@reearth",
            replacement: resolve(__dirname, "..", "src")
          }
        ]
      },
      server: {
        watch: {
          // https://github.com/storybookjs/storybook/issues/22253#issuecomment-1673229400
          ignored: ["**/.env"]
        }
      },
      optimizeDeps: {
        exclude: ["storybook"]
      }
    });
  },
};

export default config;
