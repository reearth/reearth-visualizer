/**
 * Plugin API shared teardown — runs ONCE after all plugin-api tests finish.
 *
 * Reads .auth/plugin-project.json, deletes the shared project via GraphQL,
 * and removes the state file. Errors are tolerated so CI never hangs.
 *
 * This file is automatically run as the teardown project of plugin-api-setup
 * (see playwright.config.ts: teardown: "plugin-api-teardown").
 */

import fs from "fs";
import path from "path";

import { test as teardown } from "@playwright/test";
import { createPluginClient, PluginFixturePage } from "@pages/pluginFixturePage";

const STATE_PATH = path.join(__dirname, "../../.auth/plugin-project.json");

teardown("delete shared plugin project", async ({ request }) => {
  if (!fs.existsSync(STATE_PATH)) {
    console.warn("[plugin-api-teardown] State file missing — nothing to clean up.");
    return;
  }

  let projectId: string;
  try {
    ({ projectId } = JSON.parse(fs.readFileSync(STATE_PATH, "utf-8")));
  } catch {
    console.warn("[plugin-api-teardown] Could not parse state file — removing it.");
    try {
      fs.unlinkSync(STATE_PATH);
    } catch {
      // ignore
    }
    return;
  }

  try {
    const client = createPluginClient(request);
    // page is not needed for teardown (only client.mutate is called)
    const fixture = new PluginFixturePage(null, client);
    await fixture.teardown(projectId);
    console.log(`[plugin-api-teardown] Deleted project ${projectId}`);
  } finally {
    try {
      fs.unlinkSync(STATE_PATH);
    } catch {
      console.warn("[plugin-api-teardown] Could not remove state file — continuing.");
    }
  }
});
