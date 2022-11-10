/// <reference types="vite/client" />
/// <reference types="vitest" />

import { readFileSync } from "fs";
import { resolve } from "path";

import yaml from "@rollup/plugin-yaml";
import react from "@vitejs/plugin-react";
import { readEnv } from "read-env";
import { defineConfig, loadEnv, type Plugin } from "vite";
import cesium from "vite-plugin-cesium";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

export default defineConfig({
  envPrefix: "REEARTH_WEB_",
  plugins: [react(), yaml(), cesium(), serverHeaders(), config(), tsconfigPaths()],
  define: {
    "process.env.QTS_DEBUG": "false", // quickjs-emscripten
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        published: resolve(__dirname, "published.html"),
      },
    },
  },
  resolve: {
    alias: [
      { find: "crypto", replacement: "crypto-js" }, // quickjs-emscripten
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    exclude: [...configDefaults.exclude, "e2e/*"],
    coverage: {
      all: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.cy.tsx",
        "src/**/*.stories.tsx",
        "src/gql/graphql-client-api.tsx",
        "src/test/**/*",
      ],
      reporter: ["text", "json", "lcov"],
    },
  },
});

function serverHeaders(): Plugin {
  return {
    name: "server-headers",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Service-Worker-Allowed", "/");
        next();
      });
    },
  };
}

function config(): Plugin {
  return {
    name: "reearth-config",
    async configureServer(server) {
      const configRes = JSON.stringify(
        {
          api: "http://localhost:8080/api",
          published: "/published.html?alias={}",
          ...readEnv("REEARTH_WEB", {
            source: loadEnv(
              server.config.mode,
              server.config.envDir ?? process.cwd(),
              server.config.envPrefix,
            ),
          }),
          ...loadJSON("./reearth-config.json"),
        },
        null,
        2,
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
    },
  };
}

function loadJSON(path: string): any {
  try {
    return JSON.parse(readFileSync(path, "utf8")) || {};
  } catch (err) {
    return {};
  }
}
