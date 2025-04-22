import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { DashBoardPage } from "../pages/dashBoardPage";
import { ProjectsPage } from "../pages/projectsPage";
import { RecycleBinPage } from "../pages/recycleBinPage";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required variables.");
}
const projectName = faker.lorem.word(5);
const projectDescription = faker.lorem.sentence();
const specialProjectName = faker.lorem.word(5) + "!@#$%^&*()_+";

test.describe("Project Management", () => {
  let context: BrowserContext;
  let page: Page;
  let loginPage: LoginPage;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let recycleBinPage: RecycleBinPage;
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      recordVideo: {
        dir: "videos/",
        size: { width: 1280, height: 720 }
      }
    });
    page = await context.newPage();
    loginPage = new LoginPage(page);
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    recycleBinPage = new RecycleBinPage(page);
    await page.goto(REEARTH_WEB_E2E_BASEURL, { waitUntil: "networkidle" });
  });

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

  test("Login with valid credentials", async ({ page }) => {
    await loginPage.login(REEARTH_E2E_EMAIL, REEARTH_E2E_PASSWORD);
    await expect(dashBoardPage.projects).toBeVisible();
    await expect(dashBoardPage.assets).toBeVisible();
    await expect(dashBoardPage.recycleBin).toBeVisible();
    await expect(dashBoardPage.starred).toBeVisible();
    await expect(dashBoardPage.pluginPlayground).toBeVisible();
    await expect(dashBoardPage.documentation).toBeVisible();
  });

  test("Verify project creation modal", async () => {
    await dashBoardPage.projects.click();
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
    await projectsPage.createNewProject(projectName, projectDescription);
    await expect(projectsPage.noticeBanner).toBeVisible();
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("Remove the project to the Recycle Bin", async () => {
    await projectsPage.deleteProject(projectName);
    await expect(
      page.getByText("Successfully moved to Recycle bin!")
    ).toBeVisible();
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
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      specialProjectName,
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
});
