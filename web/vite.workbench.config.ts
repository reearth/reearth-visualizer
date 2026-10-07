/// <reference types="vite/client" />

import { resolve } from "path";

import yaml from "@rollup/plugin-yaml";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type PluginOption } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

import { createSharedConfig } from "./vite.config.shared";

const NO_MINIFY = !!process.env.NO_MINIFY;

const sharedConfig = createSharedConfig();

/**
 * Vite configuration for the Workbench build.
 *
 * The Workbench is a standalone, editor-less viewer for local plugin development.
 * It is built independently from the main app and released as a separate artifact.
 *
 * Key differences from main app config:
 * - base: "./" - allows serving from any local port or subpath
 * - outDir: "dist-workbench" - separate output directory
 * - Single entry point: workbench.html
 * - No server config plugins (config, serverHeaders) - runtime only
 */
export default defineConfig({
  base: "./", // Relative paths for portability
  envPrefix: "REEARTH_WEB_",
  plugins: [
    svgr(),
    react(),
    yaml() as PluginOption,
    sharedConfig.cesiumPlugin,
    tsconfigPaths()
  ],
  // https://github.com/storybookjs/storybook/issues/25256
  assetsInclude: ["/sb-preview/runtime.js"],
  define: sharedConfig.define,
  mode: NO_MINIFY ? "development" : undefined,
  server: {
    port: 3000,
    // Vite serves web/index.html (the main app) at "/", so open the Workbench
    // entry explicitly. Do not access "/" on this server expecting the Workbench.
    open: "/workbench.html"
  },
  build: {
    target: "esnext",
    outDir: "dist-workbench",
    assetsDir: "static",
    rollupOptions: {
      input: {
        workbench: resolve(__dirname, "workbench.html")
      }
    },
    minify: NO_MINIFY ? false : "esbuild"
  },
  optimizeDeps: sharedConfig.optimizeDeps,
  resolve: sharedConfig.resolve
});
