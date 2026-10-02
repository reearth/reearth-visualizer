/// <reference types="vite/client" />

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

import type { UserConfig } from "vite";
import cesium from "vite-plugin-cesium";

import pkg from "./package.json";

let commitHash = "";
try {
  commitHash = execSync("git rev-parse HEAD").toString().trimEnd();
} catch {
  // noop
}

let cesiumVersion = "";
try {
  const cesiumPackageJson = JSON.parse(
    readFileSync(
      resolve(__dirname, "node_modules", "cesium", "package.json"),
      "utf-8"
    )
  );
  cesiumVersion = cesiumPackageJson.version;
} catch {
  // noop
}

/**
 * Shared configuration fragment for all Vite configs (main app, published, workbench).
 * Ensures consistent build settings across all entry points.
 */
export function createSharedConfig(): Pick<
  UserConfig,
  "define" | "resolve" | "optimizeDeps"
> & {
  cesiumPlugin: ReturnType<typeof cesium>;
  appVersion: string;
  commitHash: string;
} {
  return {
    define: {
      "process.env.QTS_DEBUG": "false", // quickjs-emscripten
      __APP_VERSION__: JSON.stringify(pkg.version),
      __REEARTH_COMMIT_HASH__: JSON.stringify(
        process.env.GITHUB_SHA || commitHash
      ),
      global: "globalThis"
    },
    resolve: {
      alias: [
        { find: "crypto", replacement: "crypto-js" }, // quickjs-emscripten
        { find: "path", replacement: "path-browserify" }, // Browser polyfill for path
        {
          find: "quickjs-emscripten-sync",
          replacement: resolve(
            __dirname,
            "node_modules/quickjs-emscripten-sync/dist/quickjs-emscripten-sync.mjs"
          )
        },
        {
          find: "react-align",
          replacement: resolve(
            __dirname,
            "node_modules/react-align/dist/react-align.mjs"
          )
        }
      ]
    },
    optimizeDeps: {
      exclude: ["quickjs-emscripten"]
    },
    cesiumPlugin: cesium({
      cesiumBaseUrl: cesiumVersion ? `cesium-${cesiumVersion}/` : undefined
    }),
    appVersion: pkg.version,
    commitHash: process.env.GITHUB_SHA || commitHash
  };
}
