import { readFileSync } from "fs";

import { defineConfig } from "cypress";
import { parse } from "dotenv";

const env = parse(readFileSync(".env")) || {};

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    env,
  },
  fixturesFolder: false,
});
