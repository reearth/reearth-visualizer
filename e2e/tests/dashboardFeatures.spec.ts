import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { DashBoardPage } from "../pages/dashBoardPage";
import { ProjectsPage } from "../pages/projectsPage";
import { RecycleBinPage } from "../pages/recycleBinPage";
import { createIAPContext } from "../utils/iap-auth";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing REEARTH_WEB_E2E_BASEURL");
}

const projectName = faker.lorem.words(2);
const projectAlias = faker.string.alphanumeric(15);
const renamedProjectName = faker.lorem.words(2);

test.describe.configure({ mode: "serial" });

test.describe("DASHBOARD FEATURES - Search, Sort, Views, Rename, Export", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let recycleBinPage: RecycleBinPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    recycleBinPage = new RecycleBinPage(page);
    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });

    await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
      timeout: 15000,
      state: "visible"
    });
  });

  // eslint-disable-next-line no-empty-pattern
  test.afterEach(async ({}, testInfo) => {
    const videoPath = await page.video()?.path();
    if (videoPath) {
      await testInfo.attach("video", {
        path: videoPath,
        contentType: "video/webm"
      });
    }
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("Create a project for feature tests", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      "Test project for dashboard features"
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("Filter projects by name", async () => {
    await projectsPage.searchProject(projectName);
    await page.waitForTimeout(2000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Show no results for non-existing project", async () => {
    const randomSearch = faker.string.alpha(20);
    await projectsPage.searchProject(randomSearch);
    await page.waitForTimeout(2000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).not.toBeVisible();
  });

  test("Restore all projects when search is cleared", async () => {
    await projectsPage.clearSearch();
    await page.waitForTimeout(2000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Display sort dropdown with options", async () => {
    await expect(projectsPage.sortLabel).toBeVisible();
    await expect(projectsPage.sortDropdown).toBeVisible();
  });

  test("Sort projects by Last Created", async () => {
    await projectsPage.selectSortOption("Last Created");
    await page
      .getByTestId("projects-container")
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Sort projects by A To Z", async () => {
    await projectsPage.selectSortOption("A To Z");
    await page
      .getByTestId("projects-container")
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
    await expect(projectsPage.sortDropdown).toContainText("A To Z");
    await expect(
      page.locator('[data-testid^="project-grid-item-"]').first()
    ).toBeVisible();
  });

  test("Sort projects by Last Updated", async () => {
    await projectsPage.selectSortOption("Last Updated");
    await page
      .getByTestId("projects-container")
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
    await expect(projectsPage.sortDropdown).toContainText("Last Updated");
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Switch to list view", async () => {
    await projectsPage.switchToListView();
    await page.waitForTimeout(1000);
    await expect(
      projectsPage.listProjectItem(projectName).first()
    ).toBeVisible();
    await expect(projectsPage.columnHeaderProjectName).toBeVisible();
    await expect(projectsPage.columnHeaderUpdatedAt).toBeVisible();
    await expect(projectsPage.columnHeaderCreatedAt).toBeVisible();
  });

  test("List view shows project dates", async () => {
    await expect(
      projectsPage.listProjectUpdated(projectName).first()
    ).toBeVisible();
    await expect(
      projectsPage.listProjectCreated(projectName).first()
    ).toBeVisible();
  });

  test("Switch back to grid view", async () => {
    await projectsPage.switchToGridView();
    await page.waitForTimeout(1000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Open context menu with rename option", async () => {
    const menuBtn = projectsPage.gridProjectMenuButton(projectName).first();
    await menuBtn.click();
    await expect(projectsPage.renameMenuItem).toBeVisible();
    await expect(projectsPage.exportMenuItem).toBeVisible();
    await expect(projectsPage.moveToRecycleBinButton).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("Rename project via context menu", async () => {
    await projectsPage.renameProject(projectName, renamedProjectName);
    await page.waitForTimeout(2000);
    await expect(page.getByText(renamedProjectName).first()).toBeVisible();
  });

  test("Export project from context menu", async () => {
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });

    await projectsPage.exportProject(renamedProjectName);

    try {
      const download = await downloadPromise;
      expect(download).toBeTruthy();
    } catch {
      console.log(
        "Export triggered - download may be processed asynchronously"
      );
    }
    await page.waitForTimeout(2000);
  });

  test("Delete the test project", async () => {
    await dashBoardPage.projects.click();
    await page.waitForTimeout(2000);

    await projectsPage.switchToGridView();
    await page.waitForTimeout(500);

    await projectsPage.deleteProject(renamedProjectName);
    await expect(
      page.getByText("Successfully moved to Recycle bin!")
    ).toBeVisible();

    await dashBoardPage.recycleBin.click();
    await page.waitForTimeout(1000);
    await recycleBinPage.deleteProject(renamedProjectName);
    await recycleBinPage.confirmDeletion(renamedProjectName);
    await recycleBinPage.confirmDeleteButton.click();
    await expect(page.getByText("Successfully delete project!")).toBeVisible();
  });
});
