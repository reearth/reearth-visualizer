/// <reference types="vite/client" />
/// <reference types="vitest" />

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

import yaml from "@rollup/plugin-yaml";
import react from "@vitejs/plugin-react-swc";
import { readEnv } from "read-env";
import { defineConfig, loadEnv, PluginOption, type Plugin } from "vite";
import cesium from "vite-plugin-cesium";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

import pkg from "./package.json";

const NO_MINIFY = !!process.env.NO_MINIFY;
const DEFAULT_CESIUM_ION_TOKEN_LENGTH = 177;

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

export default defineConfig({
  envPrefix: "REEARTH_WEB_",
  plugins: [
    svgr(),
    react(),
    yaml() as PluginOption,
    cesium({
      cesiumBaseUrl: cesiumVersion ? `cesium-${cesiumVersion}/` : undefined
    }),
    serverHeaders(),
    config(),
    tsconfigPaths()
  ],
  // https://github.com/storybookjs/storybook/issues/25256
  assetsInclude: ["/sb-preview/runtime.js"],
  define: {
    "process.env.QTS_DEBUG": "false", // quickjs-emscripten
    __APP_VERSION__: JSON.stringify(pkg.version),
    __REEARTH_COMMIT_HASH__: JSON.stringify(
      process.env.GITHUB_SHA || commitHash
    )
  },
  mode: NO_MINIFY ? "development" : undefined,
  server: {
    port: 3000
  },
  build: {
    target: "esnext",
    assetsDir: "static", // avoid conflicts with backend asset endpoints
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        published: resolve(__dirname, "published.html")
      }
    },
    minify: NO_MINIFY ? false : "esbuild"
  },
  resolve: {
    alias: [
      { find: "crypto", replacement: "crypto-js" } // quickjs-emscripten
    ]
  }
});

function serverHeaders(): Plugin {
  return {
    name: "server-headers",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Service-Worker-Allowed", "/");
        next();
      });
    }
  };
}

function config(): Plugin {
  return {
    name: "reearth-config",
    async configureServer(server) {
      const envs = loadEnv(
        server.config.mode,
        server.config.envDir ?? process.cwd(),
        server.config.envPrefix
      );
      const remoteReearthConfig = envs.REEARTH_WEB_CONFIG_URL
        ? await (await fetch(envs.REEARTH_WEB_CONFIG_URL)).json()
        : {};
      const remoteCesiumIonTokenResponseText =
        envs.REEARTH_WEB_CESIUM_ION_TOKEN_URL
          ? await (await fetch(envs.REEARTH_WEB_CESIUM_ION_TOKEN_URL)).text()
          : undefined;
      const remoteCesiumIonToken =
        remoteCesiumIonTokenResponseText?.length ===
        DEFAULT_CESIUM_ION_TOKEN_LENGTH
          ? remoteCesiumIonTokenResponseText
          : "";
      const configRes = JSON.stringify(
        {
          ...remoteReearthConfig,
          api: "http://localhost:8080/api",
          published: "/published.html?alias={}",
          ...(remoteCesiumIonToken
            ? { cesiumIonAccessToken: remoteCesiumIonToken }
            : {}),
          // Set the Ion token as an environment variables here.
          // ex: `REEARTH_WEB_CESIUM_ION_ACCESS_TOKEN="ION_TOKEN" yarn start`
          ...(envs.REEARTH_WEB_CESIUM_ION_ACCESS_TOKEN
            ? { cesiumIonAccessToken: envs.REEARTH_WEB_CESIUM_ION_ACCESS_TOKEN }
            : {}),
          ...readEnv("REEARTH_WEB", {
            source: envs
          }),
          ...loadJSON("./reearth-config.json")
        },
        null,
        2
      );

      server.middlewares.use((req, res, next) => {
        if (req.method === "GET" && req.url === "/reearth_config.json") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.write(configRes);
          res.end();
        } else {
          next();
        }
      });
    }
  };
}

function loadJSON(path: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(path, "utf8")) || {};
  } catch (_err) {
    return {};
  }
}
