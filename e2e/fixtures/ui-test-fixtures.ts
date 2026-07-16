/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { AccountSettingsPage } from "../pages/accountSettingsPage";
import { CesiumViewerPage } from "../pages/cesiumViewerPage";
import { DashBoardPage } from "../pages/dashBoardPage";
import { DataSourceManagerPage } from "../pages/dataSourceManagerPage";
import { LayerStylePanelPage } from "../pages/layerStylePanelPage";
import { MembersPage } from "../pages/membersPage";
import { PhotoOverlayPage } from "../pages/photoOverlayPage";
import { ProjectScreenPage } from "../pages/projectScreenPage";
import { ProjectSettingsPage } from "../pages/projectSettingsPage";
import { ProjectsPage } from "../pages/projectsPage";
import { RecycleBinPage } from "../pages/recycleBinPage";
import { WorkspaceSettingsPage } from "../pages/workspaceSettingsPage";
import { createIAPContext } from "../utils/iap-auth";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing REEARTH_WEB_E2E_BASEURL");
}

type UIFixtures = {
  dashBoardPage: DashBoardPage;
  projectsPage: ProjectsPage;
  recycleBinPage: RecycleBinPage;
  projectScreenPage: ProjectScreenPage;
  projectSettingsPage: ProjectSettingsPage;
  cesiumViewerPage: CesiumViewerPage;
  membersPage: MembersPage;
  workspaceSettingsPage: WorkspaceSettingsPage;
  accountSettingsPage: AccountSettingsPage;
  photoOverlayPage: PhotoOverlayPage;
  dataSourceManagerPage: DataSourceManagerPage;
  layerStylePanelPage: LayerStylePanelPage;
};

export const test = base.extend<UIFixtures>({
  // Overrides the built-in `page` fixture: one fresh IAP-aware context per
  // test (rather than shared across a whole file), landed on the
  // dashboard, with the video attached on teardown. Video is only
  // finalized once its context closes, and Allure locks in a test's
  // result the moment that test ends — so the close-then-attach here,
  // inside the fixture teardown, must happen before this test is marked
  // done, not in a later afterAll.
  page: async ({ browser }, use, testInfo) => {
    const context = await createIAPContext(
      browser,
      REEARTH_WEB_E2E_BASEURL || "",
      { storageState: STORAGE_STATE }
    );
    const page = await context.newPage();
    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });
    await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
      timeout: 15000,
      state: "visible"
    });

    await use(page);

    const videoPath = await page.video()?.path();
    await context.close();
    if (videoPath) {
      await testInfo.attach("video", {
        path: videoPath,
        contentType: "video/webm"
      });
    }
  },

  dashBoardPage: async ({ page }, use) => {
    await use(new DashBoardPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  recycleBinPage: async ({ page }, use) => {
    await use(new RecycleBinPage(page));
  },
  projectScreenPage: async ({ page }, use) => {
    await use(new ProjectScreenPage(page));
  },
  projectSettingsPage: async ({ page }, use) => {
    await use(new ProjectSettingsPage(page));
  },
  cesiumViewerPage: async ({ page }, use) => {
    await use(new CesiumViewerPage(page));
  },
  membersPage: async ({ page }, use) => {
    await use(new MembersPage(page));
  },
  workspaceSettingsPage: async ({ page }, use) => {
    await use(new WorkspaceSettingsPage(page));
  },
  accountSettingsPage: async ({ page }, use) => {
    await use(new AccountSettingsPage(page));
  },
  photoOverlayPage: async ({ page }, use) => {
    await use(new PhotoOverlayPage(page));
  },
  dataSourceManagerPage: async ({ page }, use) => {
    await use(new DataSourceManagerPage(page));
  },
  layerStylePanelPage: async ({ page }, use) => {
    await use(new LayerStylePanelPage(page));
  }
});

export { expect, Page };
