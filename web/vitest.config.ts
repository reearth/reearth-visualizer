import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

// This file is required by VSCode's Vitest extension.
export default mergeConfig(viteConfig, defineConfig({}));
