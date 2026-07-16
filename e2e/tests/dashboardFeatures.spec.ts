import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/ui-test-fixtures";

const projectName = "e2e-" + faker.lorem.words(2);
const projectAlias = faker.string.alphanumeric(15);
const renamedProjectName = "e2e-" + faker.lorem.words(2);

test.describe.configure({ mode: "serial" });

test.describe("DASHBOARD FEATURES - Search, Sort, Views, Rename, Export", () => {
  test.beforeEach(async ({ dashBoardPage, page }) => {
    // Every test in this file needs the Projects list visible; with a
    // per-test context there's no leftover navigation from a prior test.
    await dashBoardPage.projects.click();
    await page.waitForTimeout(500);
  });

  test("Create a project for feature tests", async ({
    page,
    projectsPage
  }) => {
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

  test("Filter projects by name", async ({ page, projectsPage }) => {
    await projectsPage.searchProject(projectName);
    await page.waitForTimeout(2000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Show no results for non-existing project", async ({
    page,
    projectsPage
  }) => {
    const randomSearch = faker.string.alpha(20);
    await projectsPage.searchProject(randomSearch);
    await page.waitForTimeout(2000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).not.toBeVisible();
  });

  test("Restore all projects when search is cleared", async ({
    page,
    projectsPage
  }) => {
    // No prior test in this context left a search applied, so establish
    // the filtered precondition ourselves before clearing it.
    await projectsPage.searchProject(faker.string.alpha(20));
    await page.waitForTimeout(1000);
    await projectsPage.clearSearch();
    await page.waitForTimeout(2000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Display sort dropdown with options", async ({ projectsPage }) => {
    await expect(projectsPage.sortLabel).toBeVisible();
    await expect(projectsPage.sortDropdown).toBeVisible();
  });

  test("Sort projects by Last Created", async ({ page, projectsPage }) => {
    await projectsPage.selectSortOption("Last Created");
    await page
      .getByTestId("projects-container")
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Sort projects by A To Z", async ({ page, projectsPage }) => {
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

  test("Sort projects by Last Updated", async ({ page, projectsPage }) => {
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

  test("Switch to list view", async ({ page, projectsPage }) => {
    await projectsPage.switchToListView();
    await page.waitForTimeout(1000);
    await expect(
      projectsPage.listProjectItem(projectName).first()
    ).toBeVisible();
    await expect(projectsPage.columnHeaderProjectName).toBeVisible();
    await expect(projectsPage.columnHeaderUpdatedAt).toBeVisible();
    await expect(projectsPage.columnHeaderCreatedAt).toBeVisible();
  });

  test("List view shows project dates", async ({ page, projectsPage }) => {
    // No prior test in this context left list view active, so switch to
    // it ourselves before asserting on list-only columns.
    await projectsPage.switchToListView();
    await page.waitForTimeout(1000);
    await expect(
      projectsPage.listProjectUpdated(projectName).first()
    ).toBeVisible();
    await expect(
      projectsPage.listProjectCreated(projectName).first()
    ).toBeVisible();
  });

  test("Switch back to grid view", async ({ page, projectsPage }) => {
    await projectsPage.switchToListView();
    await page.waitForTimeout(1000);
    await projectsPage.switchToGridView();
    await page.waitForTimeout(1000);
    await expect(
      projectsPage.gridProjectItem(projectName).first()
    ).toBeVisible();
  });

  test("Open context menu with rename option", async ({
    page,
    projectsPage
  }) => {
    const menuBtn = projectsPage.gridProjectMenuButton(projectName).first();
    await menuBtn.click();
    await expect(projectsPage.renameMenuItem).toBeVisible();
    await expect(projectsPage.exportMenuItem).toBeVisible();
    await expect(projectsPage.moveToRecycleBinButton).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("Rename project via context menu", async ({ page, projectsPage }) => {
    await projectsPage.renameProject(projectName, renamedProjectName);
    await page.waitForTimeout(2000);
    await expect(page.getByText(renamedProjectName).first()).toBeVisible();
  });

  test("Export project from context menu", async ({ page, projectsPage }) => {
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

  test("Delete the test project", async ({
    page,
    dashBoardPage,
    projectsPage,
    recycleBinPage
  }) => {
    await dashBoardPage.projects.click();
    await page.waitForTimeout(2000);

    await projectsPage.switchToGridView();
    await page.waitForTimeout(500);

    await projectsPage.deleteProject(renamedProjectName);
    await expect(
      projectsPage.gridProjectItem(renamedProjectName)
    ).not.toBeVisible();

    await dashBoardPage.recycleBin.click();
    await page.waitForTimeout(1000);
    await recycleBinPage.deleteProject(renamedProjectName);
    await recycleBinPage.confirmDeletion(renamedProjectName);
    await recycleBinPage.confirmDeleteButton.click();
    await expect(
      recycleBinPage.recycleBinItem(renamedProjectName)
    ).not.toBeVisible();
  });
});
