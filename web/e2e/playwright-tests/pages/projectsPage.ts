import { Locator, Page, expect } from "@playwright/test";
import path from "path";
export class ProjectsPage {
  newProjectButton: Locator = this.page.getByRole("button", {
    name: "New Project"
  });
  importButton: Locator = this.page.getByRole("button", { name: "Import" });
  importFileInput: Locator = this.page.locator(
    'input[type="file"][accept=".zip"]'
  );
  searchProjectInput: Locator = this.page.getByPlaceholder("Search project");
  sortLabel: Locator = this.page.getByText("Sort:");
  sortDropdown: Locator = this.page.locator('[data-testid="select-input"]');
  gridViewToggle: Locator = this.page
    .locator('button[appearance="simple"] svg')
    .locator('path[d*="M6.8 2H2.6"]');
  listViewToggle: Locator = this.page
    .locator('button[appearance="simple"] svg')
    .locator('path[d*="M2.5 4H13.5"]');
  allProjectsHeader: Locator = this.page.getByText("All projects");
  columnHeaderProjectName: Locator = this.page.getByText("Project Name");
  columnHeaderUpdatedAt: Locator = this.page.getByText("Updated At");
  columnHeaderCreatedAt: Locator = this.page.getByText("Created At");
  assetMigrationTitle: Locator = this.page.getByText("Test_Asset_migration");
  projectDates: Locator = this.page.locator("div.css-9u2lx8 p");
  firstProjectOptions: Locator = this.page.locator("button.css-19yctgj").nth(0);
  favoriteButton: Locator = this.page
    .locator("button.css-19yctgj svg")
    .locator('path[d*="M8.27569 11.9208"]');
  modalTitle: Locator = this.page.getByText("Create new project");
  projectNameLabel: Locator = this.page.getByText("Project Name *");
  projectNameInput: Locator = this.page.locator('input[placeholder="Text"]');
  descriptionLabel: Locator = this.page.getByText("Description");
  descriptionTextarea: Locator = this.page.locator(
    'textarea[placeholder="Write down your content"]'
  );
  cancelButton: Locator = this.page.getByRole("button", { name: "Cancel" });
  applyButton: Locator = this.page.getByRole("button", { name: "Apply" });
  noticeBanner: Locator = this.page.getByText("Notice");

  projectFavrtButton: Locator = this.page
    .locator('button[appearance="simple"]')
    .nth(0);
  renameButton: Locator = this.page.getByText("Rename");
  projectSettingLink: Locator = this.page.getByRole("link", {
    name: "Project Setting"
  });
  projectAssetsLink: Locator = this.page.getByRole("link", {
    name: "Project Assets"
  });
  exportButton: Locator = this.page.getByText("Export");
  moveToRecycleBinButton: Locator = this.page.getByText("Move to Recycle Bin");

  popUpCancelButton: Locator = this.page.getByRole("button", {
    name: "Cancel"
  });
  popUpRemoveButton: Locator = this.page.getByRole("button", {
    name: "Remove"
  });

  starIcon: Locator = this.page.locator('svg[color="#f1c21b"]');
  starredSection: Locator = this.page.locator('div:has(p:has-text("Starred"))');

  constructor(private page: Page) {}

  async createNewProject(projectName: string, description: string) {
    await this.projectNameInput.waitFor({ state: "visible" });
    await this.projectNameInput.fill("");
    await this.projectNameInput.fill(projectName);
    await this.descriptionTextarea.fill(description);
    await this.applyButton.click();
  }
  async deleteProject(projectName: string) {
    const projectRow = this.page
      .locator(`.css-96bt7k`, {
        hasText: projectName
      })
      .first();
    const projectMenuButton = projectRow
      .locator('button[appearance="simple"]')
      .nth(1);
    await projectMenuButton.click();
    await this.moveToRecycleBinButton.waitFor({ state: "visible" });
    await this.moveToRecycleBinButton.click();
    await this.popUpRemoveButton.waitFor({ state: "visible" });
    await this.popUpRemoveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async starredProject(projectName: string) {
    const projectRow = this.page.locator(`.css-96bt7k`, {
      hasText: projectName
    });
    const projectMenuButton = projectRow
      .locator('button[appearance="simple"]')
      .nth(0);
    await projectMenuButton.click();
  }

  async verifyImportProject(projectName: string) {
    const projectRow = this.page
      .locator(`div.css-1r5b2ac`, {
        hasText: projectName
      })
      .first();
    await expect(projectRow).toBeVisible();
  }

  async verifyStarredProject(specialProjectName: string) {
    const projectRow = this.page.locator(
      `div:has-text("${specialProjectName}")`
    );
    const starIcon = projectRow.locator('svg[color="#f1c21b"]').first();
    await expect(starIcon).toBeVisible();
  }

  async unStarredProject(projectName: string) {
    const projectRow = this.page.locator(`.css-96bt7k`, {
      hasText: projectName
    });
    const projectMenuButton = projectRow
      .locator('button[appearance="simple"]')
      .nth(0);
    await projectMenuButton.click();
  }
  async verifyUnStarredProject(specialProjectName: string) {
    const projectRow = this.page.locator(
      `div:has-text("${specialProjectName}")`
    );
    const unStarIcon = projectRow.locator('svg[color="#e0e0e0"]').first();
    await expect(unStarIcon).toBeVisible();
  }
  starredProjectNameMenuBar(projectName: string): Locator {
    return this.page.locator(
      `xpath=//div[contains(@class, 'css-1ez7fby')]//div[contains(@title, "${projectName}")]`
    );
  }
  async goToProjectPage(projectName: string) {
    const projectRow = this.page.locator(`.css-96bt7k`, {
      hasText: projectName
    });
    await projectRow.first().dblclick();
  }

  async importProject(zipFilePath: string) {
    // Listen for file chooser and trigger it by clicking the Import button
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.importButton.click() // This triggers the file picker
    ]);

    // Set the zip file
    await fileChooser.setFiles(zipFilePath);

    // Optional: wait for upload to complete
    await this.page.waitForTimeout(2000);
  }
}
