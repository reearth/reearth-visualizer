/**
 * Plugin API shared setup — runs ONCE before all plugin-api tests.
 *
 * 1. Creates a shared project + scene via GraphQL
 * 2. Uploads reearth-api-test.zip via the UI (requires networkidle)
 * 3. Adds the unified "ReEarth API Test Widget" to the scene
 * 4. Writes { projectId, sceneId } to .auth/plugin-project.json
 *
 * All plugin-api test suites read this file in their beforeAll.
 * The project (and its widget) is deleted by _teardown.ts when all suites finish.
 *
 * Run: npx playwright test --project=plugin-api-setup
 * (automatically triggered when running --project=plugin-api)
 */

import fs from "fs";
import path from "path";

import {
  createPluginClient,
  PluginFixturePage
} from "@pages/pluginFixturePage";
import { test as setup } from "@playwright/test";
import { createIAPContext } from "@utils/iap-auth";

import { STORAGE_STATE } from "@/global-setup";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
const STATE_PATH = path.join(__dirname, "../../.auth/plugin-project.json");

setup("install shared plugin zip and widget", async ({ browser, request }) => {
  if (!REEARTH_WEB_E2E_BASEURL) {
    throw new Error("[plugin-api-setup] REEARTH_WEB_E2E_BASEURL is not set");
  }

  const context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL, {
    storageState: STORAGE_STATE
  });
  const page = await context.newPage();

  try {
    const client = createPluginClient(request);
    const fixture = new PluginFixturePage(page, client);

    // Step 1: create the shared project and scene
    const ids = await fixture.createProjectAndScene("e2e-plugin-api-shared");

    // Step 2: upload the unified plugin zip (all API extensions in one widget)
    await fixture.uploadPluginZip(ids.projectId);

    // Step 3: install the widget once — it stays for the entire test run
    await fixture.addWidget(
      ids.sceneId,
      "ReEarth API Test Widget",
      "reearth-api-test"
    );

    // Step 4: persist shared state for all test suites
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(ids, null, 2), "utf-8");
    console.log(
      `[plugin-api-setup] Done — projectId=${ids.projectId} sceneId=${ids.sceneId}`
    );
  } finally {
    await context.close();
  }
});
