import { readFileSync } from "fs";

import { defineConfig } from "cypress";
import { parse } from "dotenv";

const env = parse(read(".env") ?? "") || {};

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

function read(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}
