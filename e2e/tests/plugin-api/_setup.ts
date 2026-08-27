/**
 * Plugin API shared setup — runs ONCE before all plugin-api tests.
 *
 * Creates one project, uploads the unified reearth-api-test.zip via UI,
 * and writes { projectId, sceneId, pluginId } to .auth/plugin-project.json.
 *
 * Each API test suite reads this file in beforeAll and adds its own widget.
 * The project is deleted by _teardown.ts after all suites complete.
 *
 * Run: npx playwright test --project=plugin-api-setup
 * (automatically triggered when running --project=plugin-api)
 */

import fs from "fs";
import path from "path";

import { test as setup } from "@playwright/test";
import { createPluginClient, PluginFixturePage } from "@pages/pluginFixturePage";
import { createIAPContext } from "@utils/iap-auth";

import { STORAGE_STATE } from "@/global-setup";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
const STATE_PATH = path.join(__dirname, "../../.auth/plugin-project.json");

setup("install shared plugin zip", async ({ browser, request }) => {
  if (!REEARTH_WEB_E2E_BASEURL) {
    throw new Error(
      "[plugin-api-setup] REEARTH_WEB_E2E_BASEURL is not set"
    );
  }

  const context = await createIAPContext(
    browser,
    REEARTH_WEB_E2E_BASEURL,
    { storageState: STORAGE_STATE }
  );
  const page = await context.newPage();

  try {
    const client = createPluginClient(request);
    const fixture = new PluginFixturePage(page, client);

    const ids = await fixture.createProjectAndScene("e2e-plugin-api-shared");
    await fixture.uploadPluginZip(ids.projectId);

    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(ids, null, 2), "utf-8");
    console.log(
      `[plugin-api-setup] State saved — projectId=${ids.projectId} sceneId=${ids.sceneId}`
    );
  } finally {
    await context.close();
  }
});
