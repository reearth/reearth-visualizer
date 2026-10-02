#!/usr/bin/env node

/**
 * Generate workbench-manifest.json for the Workbench release artifact.
 *
 * - version: REEARTH_WORKBENCH_VERSION (release tag) ?? GITHUB_REF_NAME ?? package.json
 * - pluginApiVersion: from pluginAPI/constaint.ts
 * - commit: GITHUB_SHA ?? `git rev-parse HEAD`
 *
 * Output: dist-workbench/workbench-manifest.json
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8")
);
const version =
  process.env.REEARTH_WORKBENCH_VERSION ||
  process.env.GITHUB_REF_NAME ||
  packageJson.version;

const constaintPath = resolve(
  __dirname,
  "../src/app/features/Visualizer/Crust/Plugins/pluginAPI/constaint.ts"
);
const constaintContent = readFileSync(constaintPath, "utf-8");
const pluginApiVersionMatch = constaintContent.match(
  /REEATH_PLUGIN_API_VERSION\s*=\s*"([^"]+)"/
);
const pluginApiVersion = pluginApiVersionMatch
  ? pluginApiVersionMatch[1]
  : "unknown";

let commit =
  process.env.REEARTH_WORKBENCH_COMMIT || process.env.GITHUB_SHA || "";
if (!commit) {
  try {
    commit = execSync("git rev-parse HEAD").toString().trim();
  } catch {
    commit = "unknown";
  }
}

const manifest = {
  version,
  pluginApiVersion,
  commit
};

const outputPath = resolve(
  __dirname,
  "../dist-workbench/workbench-manifest.json"
);
writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

console.log(`Generated workbench manifest at ${outputPath}`);
console.log(JSON.stringify(manifest, null, 2));
