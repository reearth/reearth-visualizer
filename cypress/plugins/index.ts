///<reference types="cypress" />
///<reference types="./cypress-dotenv" />

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import webpackPreprocessor from "@cypress/webpack-preprocessor";
import dotenvPlugin from "cypress-dotenv";

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  config = dotenvPlugin(config, {}, true);
  config.env = {
    ...config.env,
    ...Object.fromEntries(
      Object.entries(process.env).filter(([k]) => k.startsWith("REEARTH_WEB_")),
    ),
  };
  config.ignoreTestFiles = ["**/examples/**/*", "types.ts"];

  on("task", {
    log(message) {
      console.log(message);
      return null;
    },
  });

  on(
    "file:preprocessor",
    webpackPreprocessor({
      webpackOptions: {
        mode: "development",
        module: {
          rules: [
            {
              test: /\.[jt]sx?$/,
              exclude: /node_modules/,
              use: "babel-loader",
            },
          ],
        },
        resolve: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    }),
  );

  return config;
};

export default pluginConfig;
