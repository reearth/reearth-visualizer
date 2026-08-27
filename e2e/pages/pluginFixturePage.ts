import fs from "fs";
import path from "path";

import { FrameLocator, Page } from "@playwright/test";

import { GraphQLClient } from "../api/graphql/client";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  REMOVE_WIDGET,
  UPDATE_PROJECT
} from "../api/graphql/mutations";
import { GET_ME, GET_SCENE_WIDGETS } from "../api/graphql/queries";

const PLUGIN_ZIP = path.join(
  __dirname,
  "../fixtures/plugins/reearth-api-test.zip"
);

const SHARED_STATE_PATH = path.join(__dirname, "../.auth/plugin-project.json");

export type ProjectIds = {
  projectId: string;
  sceneId: string;
  pluginId: string;
};

/**
 * Handles fixture plugin lifecycle for plugin API E2E tests.
 *
 * Zip upload is UI-driven (once, via _setup.ts). Each API test suite
 * adds/removes its own widget via GraphQL (ADD_WIDGET / REMOVE_WIDGET).
 *
 * Usage pattern:
 *   _setup.ts:    fixture.createProjectAndScene() + uploadPluginZip()
 *   each suite:   fixture.addWidget() in beforeAll, removeWidget() in afterAll
 */
export class PluginFixturePage {
  constructor(
    private page: Page,
    private client: GraphQLClient
  ) {}

  /**
   * Locates the active plugin widget iframe.
   *
   * Re:Earth renders plugin UI in Zushi iframes with no name/title/id.
   * Each test suite ensures only ONE widget is active at a time (add in
   * beforeAll, remove in afterAll), so this selector is unambiguous.
   */
  get iframe(): FrameLocator {
    return this.page.frameLocator(".zushi-ui-surface-container iframe");
  }

  /**
   * Creates a project and scene via GraphQL. Shared across all plugin
   * API suites — called once from _setup.ts.
   */
  async createProjectAndScene(projectName: string): Promise<ProjectIds> {
    const { data: me } = await this.client.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: projData } = await this.client.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: projectName,
        coreSupport: true
      }
    });
    const projectId = projData.createProject.project.id;

    const { data: sceneData } = await this.client.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    const sceneId = sceneData.createScene.scene.id;

    // pluginId matches the `id` field in reearth-api-test/reearth.yml
    const pluginId = "reearth-api-test-plugin";

    return { projectId, sceneId, pluginId };
  }

  /**
   * Uploads the unified plugin zip to the project via the real UI.
   * Called once from _setup.ts — all API test suites share the result.
   *
   * Uses "networkidle" so Apollo Client's scene query finishes before
   * interaction. Without it, sceneId is null and uploadPlugin silently returns.
   */
  async uploadPluginZip(projectId: string): Promise<void> {
    const baseUrl = process.env.REEARTH_WEB_E2E_BASEURL?.replace(/\/$/, "");
    console.log(
      `[PluginFixture] Navigating to plugin settings for project ${projectId}`
    );
    await this.page.goto(
      `${baseUrl}/settings/projects/${projectId}/plugins`,
      { waitUntil: "networkidle" }
    );

    console.log(
      `[PluginFixture] Waiting for project-settings-tab-plugins to be visible`
    );
    await this.page
      .getByTestId("project-settings-tab-plugins")
      .waitFor({ state: "visible", timeout: 15_000 });

    console.log(`[PluginFixture] Clicking Personal Installed tab`);
    await this.page.getByTestId("tab-Personal").click();

    console.log(
      `[PluginFixture] Triggering file chooser for zip: ${PLUGIN_ZIP}`
    );
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.page.getByText("Zip file from PC").click()
    ]);
    await fileChooser.setFiles(PLUGIN_ZIP);

    // Wait for the plugin name to appear in the list (not the toast, which
    // disappears in ~3s and causes race conditions).
    console.log(
      `[PluginFixture] Waiting for "ReEarth API Test" to appear in installed list`
    );
    await this.page
      .getByText("ReEarth API Test", { exact: true })
      .waitFor({ state: "visible", timeout: 30_000 });
    console.log(`[PluginFixture] Plugin zip uploaded successfully`);
  }

  /**
   * Adds a widget instance via the UI (Add Widget popup), then queries the
   * scene to return the new widgetId. Callers must pass it to removeWidget()
   * in afterAll.
   *
   * @param sceneId     - from PluginFixturePage.readSharedState()
   * @param widgetName  - display name in Add Widget popup (reearth.yml extension.name)
   * @param extensionId - yml extension id, used to locate the widget after add
   */
  async addWidget(
    sceneId: string,
    widgetName: string,
    extensionId: string
  ): Promise<string> {
    await this.addWidgetFromEditorUI(sceneId, widgetName);

    // Find the widget by extensionId — more reliable than a before/after diff
    const { data } = await this.client.query<{
      node: { widgets: { id: string; extensionId: string }[] };
    }>(GET_SCENE_WIDGETS, { sceneId });

    const widget = (data?.node?.widgets ?? []).find(
      w => w.extensionId === extensionId
    );
    if (!widget) {
      throw new Error(
        `[PluginFixture] addWidget: no widget with extensionId "${extensionId}" found after UI add`
      );
    }
    console.log(
      `[PluginFixture] Widget added: widgetId=${widget.id} extensionId=${extensionId}`
    );
    return widget.id;
  }

  private async addWidgetFromEditorUI(
    sceneId: string,
    widgetName: string
  ): Promise<void> {
    const baseUrl = process.env.REEARTH_WEB_E2E_BASEURL?.replace(/\/$/, "");
    console.log(
      `[PluginFixture] Navigating to editor widgets tab for scene ${sceneId}`
    );
    await this.page.goto(`${baseUrl}/scene/${sceneId}/widgets`, {
      waitUntil: "domcontentloaded"
    });

    // Panel uses camelCase dataTestid prop — outer testid is not in DOM;
    // use "widget-manager-wrapper" from the inner Wrapper styled-div instead.
    console.log(`[PluginFixture] Waiting for widget-manager-wrapper`);
    await this.page
      .getByTestId("widget-manager-wrapper")
      .waitFor({ state: "visible", timeout: 60_000 });

    // Sidebar nav also has role="menu" — must scope to floating-ui popup attr.
    console.log(`[PluginFixture] Clicking add-widget-button`);
    await this.page.getByTestId("add-widget-button").click();

    const popupMenu = this.page.locator('[role="menu"][data-floating-ui-focusable]');
    await popupMenu.waitFor({ state: "visible", timeout: 10_000 });

    console.log(`[PluginFixture] Clicking "${widgetName}" menuitem`);
    await popupMenu.getByRole("menuitem", { name: widgetName }).click();

    await this.page
      .getByTestId("installed-widgets-list")
      .getByText(widgetName)
      .first()
      .waitFor({ state: "visible", timeout: 20_000 });
    console.log(`[PluginFixture] Widget "${widgetName}" added via UI`);
  }

  /**
   * Removes a widget from the shared scene via GraphQL.
   * Called in each suite's afterAll so the next suite starts with a clean scene.
   * Errors are swallowed — teardown must never break afterAll.
   */
  async removeWidget(sceneId: string, widgetId: string): Promise<void> {
    console.log(`[PluginFixture] Removing widget: ${widgetId}`);
    await this.client
      .mutate(REMOVE_WIDGET, { input: { type: "DESKTOP", sceneId, widgetId } })
      .catch(err =>
        console.warn(`[PluginFixture] removeWidget failed (non-fatal): ${err}`)
      );
  }

  /**
   * Soft-deletes then permanently deletes the shared test project.
   * Called once from _teardown.ts. Errors are swallowed.
   */
  async teardown(projectId: string): Promise<void> {
    await this.client
      .mutate(UPDATE_PROJECT, { input: { projectId, deleted: true } })
      .catch(() => {});
    await this.client
      .mutate(DELETE_PROJECT, { input: { projectId } })
      .catch(() => {});
  }

  async navigateToEditor(sceneId: string): Promise<void> {
    const baseUrl = process.env.REEARTH_WEB_E2E_BASEURL?.replace(/\/$/, "");
    await this.page.goto(`${baseUrl}/scene/${sceneId}/map`, {
      waitUntil: "domcontentloaded"
    });
  }

  /**
   * Waits for the widget iframe to mount and a specific button to be visible.
   * Pass the first button text from the widget's HTML (e.g. "Set Tokyo").
   */
  async waitForIframeReady(readyButtonText = "Set Tokyo"): Promise<void> {
    await this.iframe
      .getByRole("button", { name: readyButtonText })
      .waitFor({ state: "visible", timeout: 30_000 });
  }

  // Camera API trigger helpers

  async triggerSetTokyo(): Promise<void> {
    await this.iframe.getByRole("button", { name: "Set Tokyo" }).click();
  }

  async triggerFlyToSydney(): Promise<void> {
    await this.iframe.getByRole("button", { name: "Fly Sydney" }).click();
  }

  async triggerZoomIn(): Promise<void> {
    await this.iframe.getByRole("button", { name: "Zoom In" }).click();
  }

  /**
   * Reads the shared project state written by _setup.ts.
   * Throws a descriptive error if the file is missing (run plugin-api-setup first).
   */
  static readSharedState(): ProjectIds {
    if (!fs.existsSync(SHARED_STATE_PATH)) {
      throw new Error(
        `[PluginFixture] ${SHARED_STATE_PATH} not found. ` +
          "Run the plugin-api-setup project first: " +
          "npx playwright test --project=plugin-api-setup"
      );
    }
    return JSON.parse(fs.readFileSync(SHARED_STATE_PATH, "utf-8"));
  }
}

/**
 * Creates a GraphQLClient for use in browser-test beforeAll hooks.
 * Reads auth token from .auth/api-token.json (written by api-setup project)
 * or falls back to extracting the Auth0 access_token from .auth/user.json.
 */
export function createPluginClient(
  request: import("@playwright/test").APIRequestContext
): GraphQLClient {
  const apiTokenPath = path.join(__dirname, "../.auth/api-token.json");
  const storagePath = path.join(__dirname, "../.auth/user.json");
  const apiUrl = process.env.REEARTH_E2E_API_URL?.replace(/\/$/, "");
  const endpoint = `${apiUrl}/api/graphql`;

  if (fs.existsSync(apiTokenPath)) {
    try {
      const { token, extraHeaders } = JSON.parse(
        fs.readFileSync(apiTokenPath, "utf-8")
      );
      return new GraphQLClient(request, token, extraHeaders ?? {}, endpoint);
    } catch {
      // malformed, fall through
    }
  }

  if (fs.existsSync(storagePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
      for (const origin of state.origins ?? []) {
        for (const item of origin.localStorage ?? []) {
          if (!item.name.startsWith("@@auth0spajs@@") || !item.value) continue;
          const parsed = JSON.parse(item.value);
          const token = parsed?.body?.access_token;
          if (token) {
            return new GraphQLClient(request, token, {}, endpoint);
          }
        }
      }
    } catch {
      // malformed, fall through
    }
  }

  throw new Error(
    "createPluginClient: no auth token found in .auth/api-token.json or .auth/user.json. " +
      "Run the api-setup project first: npx playwright test --project=api-setup"
  );
}
