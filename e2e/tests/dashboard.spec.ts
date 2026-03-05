import path from "path";

import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { DashBoardPage } from "../pages/dashBoardPage";
import { ProjectScreenPage } from "../pages/projectScreenPage";
import { ProjectsPage } from "../pages/projectsPage";
import { RecycleBinPage } from "../pages/recycleBinPage";
import { createIAPContext } from "../utils/iap-auth";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required variables.");
}
const projectName = faker.lorem.words(2);
const projectDescription = faker.lorem.sentence();
const specialProjectName = faker.lorem.words(2) + "!@#$%^&*()_+";
const projectAlias = faker.string.alphanumeric(15);

const fileName = "Test_Asset_migration.zip";
const docPath = path.resolve(__dirname, "../test-data", fileName);
test.describe.configure({ mode: "serial" });

test.describe("DASHBOARD - Test cases", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let recycleBinPage: RecycleBinPage;
  let projectScreenPage: ProjectScreenPage;
  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    recycleBinPage = new RecycleBinPage(page);
    projectScreenPage = new ProjectScreenPage(page);
    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });

    // Wait for dashboard to fully load
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

  test("Verify dashboard is loaded", async () => {
    await expect(dashBoardPage.projects).toBeVisible();
    await expect(dashBoardPage.recycleBin).toBeVisible();
    await expect(dashBoardPage.pluginPlayground).toBeVisible();
    await expect(dashBoardPage.documentation).toBeVisible();
  });

  test("Verify project creation modal", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    await projectsPage.newProjectButton.click();
    await expect(projectsPage.modalTitle).toBeVisible();
    await expect(projectsPage.projectNameLabel).toBeVisible();
    await expect(projectsPage.descriptionLabel).toBeVisible();
    await expect(projectsPage.cancelButton).toBeVisible();
    await expect(projectsPage.applyButton).toBeVisible();
  });

  test("Verify project creation with empty name", async () => {
    await projectsPage.projectNameInput.waitFor({ state: "visible" });
    await expect(projectsPage.applyButton).toBeDisabled();
  });

  test("Create a new project and verify after its creation", async () => {
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      projectDescription
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("Remove the project to the Recycle Bin", async () => {
    await projectsPage.deleteProject(projectName);
    // await expect(
    //   page.getByText("Successfully moved to Recycle bin!")
    // ).toBeVisible();
  });

  test("Go to the Recycle Bin and Recover the Deleted Project", async () => {
    await dashBoardPage.recycleBin.click();
    // await expect(recycleBinPage.projectTitles).toBeVisible();
    await recycleBinPage.recoverProject(projectName);
    await expect(
      page.getByText("Successfully recovered the project!")
    ).toBeVisible();
  });

  test("Verify the project has successfully been recover", async () => {
    await dashBoardPage.projects.click();
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("Remove the project, Go to the Recycle Bin And delete it ", async () => {
    await projectsPage.deleteProject(projectName);
    await expect(
      page.getByText("Successfully moved to Recycle bin!")
    ).toBeVisible();
    await dashBoardPage.recycleBin.click();
    await recycleBinPage.deleteProject(projectName);
    await recycleBinPage.confirmDeletion(projectName);
    await recycleBinPage.confirmDeleteButton.click();
    await expect(page.getByText("Successfully delete project!")).toBeVisible();
  });

  test("Verify project creation with special characters in name", async () => {
    await dashBoardPage.projects.click();
    const specialProjectDescription = "Test project with special characters";
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      specialProjectName,
      projectAlias,
      specialProjectDescription
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
    await expect(page.getByText(specialProjectName)).toBeVisible();
  });

  test("Starred and UnStarred the Project and verify it", async () => {
    await projectsPage.starredProject(specialProjectName);
    await projectsPage.verifyStarredProject(specialProjectName);
    await projectsPage.starredProjectNameMenuBar(specialProjectName);

    await projectsPage.unStarredProject(specialProjectName);
    await projectsPage.verifyUnStarredProject(specialProjectName);
    await expect(
      projectsPage.starredProjectNameMenuBar(specialProjectName)
    ).not.toBeVisible();
  });

  test("Move the project to the Recycle Bin And delete it ", async () => {
    await projectsPage.deleteProject(specialProjectName);
    await expect(
      page.getByText("Successfully moved to Recycle bin!")
    ).toBeVisible();
    await dashBoardPage.recycleBin.click();
    await recycleBinPage.deleteProject(specialProjectName);
    await recycleBinPage.confirmDeletion(specialProjectName);
    await recycleBinPage.confirmDeleteButton.click();
    await expect(page.getByText("Successfully delete project!")).toBeVisible();
  });

  test.skip("Should import a project and verify it", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.importProject(docPath);
    await projectsPage.verifyImportProject("Test_Asset_migration");
    await expect(page.getByText("Test_Asset_migration").first()).toBeVisible({
      timeout: 20000
    });
  });

  test.skip("Should verify the Imported project assests", async () => {
    await expect(
      projectsPage.gridProjectImage("Test_Asset_migration").first()
    ).toBeVisible();
    await projectsPage.goToProjectPage("Test_Asset_migration");
    await expect(projectScreenPage.scenePanel).toBeVisible({ timeout: 10000 });
    await expect(projectScreenPage.layersPanel).toBeVisible({ timeout: 10000 });
  });

  test.describe.skip("Delete the Imported Project", () => {
    let context: BrowserContext;
    let page: Page;
    let dashBoardPage: DashBoardPage;
    let projectsPage: ProjectsPage;
    test.beforeAll(async ({ browser }) => {
      test.setTimeout(20000);
      context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
        storageState: STORAGE_STATE
      });
      page = await context.newPage();
      dashBoardPage = new DashBoardPage(page);
      projectsPage = new ProjectsPage(page);
      await page.goto(REEARTH_WEB_E2E_BASEURL, {
        waitUntil: "domcontentloaded"
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
    test("Verify dashboard is loaded", async () => {
      await page.goto(REEARTH_WEB_E2E_BASEURL + "/dashboard", {
        waitUntil: "domcontentloaded"
      });
      await expect(dashBoardPage.projects).toBeVisible();
      await expect(dashBoardPage.recycleBin).toBeVisible();
      await expect(dashBoardPage.pluginPlayground).toBeVisible();
      await expect(dashBoardPage.documentation).toBeVisible();
    });

    test("Should delete all imported projects with the same name", async () => {
      await dashBoardPage.projects.click();

      // Repeatedly attempt to find and delete projects
      while (true) {
        const projectLocator = page.locator("text=Test_Asset_migration");

        const count = await projectLocator.count();

        if (count === 0) break; // Exit loop when no projects found

        for (let i = 0; i < count; i++) {
          await projectLocator.nth(0).click(); // Always delete the first match
          await projectsPage.deleteProject("Test_Asset_migration");
          await expect(
            page.getByText("Successfully moved to Recycle bin!")
          ).toBeVisible();
          await page.reload(); // Refresh list before next loop
        }
      }
    });
  });
});
