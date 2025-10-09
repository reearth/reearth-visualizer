import { Locator, Page, expect } from "@playwright/test";

export class ProjectsPage {
  newProjectButton: Locator = this.page.getByTestId("create-project-btn");
  importButton: Locator = this.page.getByTestId("import-project-btn");
  importFileInput: Locator = this.page.getByTestId("import-project-file-input");

  // Search & Sort
  searchProjectInput: Locator = this.page.getByPlaceholder("Search project");
  sortLabel: Locator = this.page.locator("p", { hasText: "Sort:" });
  sortDropdown: Locator = this.page.getByTestId("select-input");

  // View Toggles
  gridViewToggle: Locator = this.page.locator(
    'button.css-sfuwxk svg path[d*="M6.8 2H2.6"]'
  );
  listViewToggle: Locator = this.page.locator(
    'button.css-zkhtif svg path[d*="M2.5 4H13.5"]'
  );

  // Table View Headers
  columnHeaderProjectName: Locator = this.page.getByTestId(
    "projects-list-name-col"
  );
  columnHeaderUpdatedAt: Locator = this.page.getByTestId(
    "projects-list-updated-col"
  );
  columnHeaderCreatedAt: Locator = this.page.getByTestId(
    "projects-list-created-col"
  );

  // Grid View - Project Card
  gridProjectItem(projectName: string): Locator {
    return this.page.getByTestId(`project-grid-item-${projectName}`);
  }
  gridProjectTitle(projectName: string): Locator {
    return this.page.getByTestId(`project-grid-item-title-${projectName}`);
  }
  gridProjectStarButton(projectName: string): Locator {
    return this.page
      .getByTestId(`project-grid-item-star-btn-wrapper-${projectName}`)
      .locator("button");
  }
  gridProjectMenuButton(projectName: string): Locator {
    return this.page.getByTestId(`project-grid-item-menu-btn-${projectName}`);
  }
  gridProjectImage(projectName: string): Locator {
    return this.page.getByTestId(`project-grid-item-image-${projectName}`);
  }

  // All Projects Header (breadcrumb)
  allProjectsHeader: Locator = this.page.locator(
    '[data-testid="projects-breadcrumb-container"] p',
    { hasText: "All projects" }
  );

  // List View (fallback)
  assetMigrationTitle: Locator = this.page.locator(
    '[data-testid^="project-list-item-title-"]',
    { hasText: "Test_Asset_migration" }
  );
  projectDates: Locator = this.page.locator("div.css-9u2lx8 p");
  firstProjectOptions: Locator = this.page
    .locator('[data-testid^="project-list-item-menu-btn-"]')
    .first();
  favoriteButton: Locator = this.page.locator(
    'button.css-19yctgj svg path[d*="M14.9479 6.0882"]'
  );

  // Modal - Create New Project
  modalTitle: Locator = this.page.getByText("Create new project");
  projectNameLabel: Locator = this.page.getByText("Project Name *");
  projectNameInput: Locator = this.page.getByTestId("project-name-input");
  projectAliasLabel: Locator = this.page.getByText("Project Alias *");
  projectAliasInput: Locator = this.page.getByTestId("project-alias-input");
  descriptionLabel: Locator = this.page.getByText("Description");
  descriptionTextarea: Locator = this.page.getByTestId(
    "project-description-input"
  );
  cancelButton: Locator = this.page.getByRole("button", { name: "Cancel" });
  applyButton: Locator = this.page.getByRole("button", { name: "Apply" });

  // Notifications
  noticeBanner: Locator = this.page.getByText("Notice");

  // Starred Section
  projectFavrtButton: Locator = this.page
    .locator('[data-testid^="project-list-item-star-btn-"]')
    .first();
  starIcon: Locator = this.page.locator('svg[color="#f1c21b"]');
  starredSection: Locator = this.page.locator(
    '[data-testid="starred-projects-wrapper"] p',
    { hasText: "Starred" }
  );

  // Sidebar and Project Actions
  renameButton: Locator = this.page.getByText("Rename");
  projectSettingLink: Locator = this.page.getByRole("link", {
    name: "Project Setting"
  });
  projectAssetsLink: Locator = this.page.getByRole("link", {
    name: "Project Assets"
  });
  exportButton: Locator = this.page.getByText("Export");
  moveToRecycleBinButton: Locator = this.page.getByText("Move to Recycle Bin");

  // Pop-up confirmations
  popUpCancelButton: Locator = this.page.getByRole("button", {
    name: "Cancel"
  });
  popUpRemoveButton: Locator = this.page.getByRole("button", {
    name: "Remove"
  });

  constructor(private page: Page) {}

  async createNewProject(
    projectName: string,
    projectAlias: string,
    description: string
  ) {
    await this.projectNameInput.waitFor({ state: "visible" });
    await this.projectNameInput.fill("");
    await this.projectNameInput.fill(projectName);
    await this.projectAliasInput.fill("");
    await this.projectAliasInput.fill(projectAlias);
    await this.projectAliasInput.blur();
    // wait for alias validation
    await this.page.waitForTimeout(1000);
    await this.descriptionTextarea.fill(description);
    await this.applyButton.click();
  }
  async deleteProject(projectName: string) {
    const projectMenuButton = this.gridProjectMenuButton(projectName).first();
    await projectMenuButton.click();
    await this.moveToRecycleBinButton.click();
    await expect(this.popUpRemoveButton).toBeVisible();
    await this.popUpRemoveButton.click();
    await expect(this.gridProjectItem(projectName).first()).not.toBeVisible();
  }

  async starredProject(projectName: string) {
    const projectItem = this.gridProjectItem(projectName).first();
    await projectItem.hover();
    const starButton = this.gridProjectStarButton(projectName).first();
    await starButton.click();
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
    const projectItem = this.gridProjectItem(specialProjectName).first();
    await projectItem.hover();
    const starButton = this.gridProjectStarButton(specialProjectName).first();
    const starIcon = starButton.getByTestId("icon-starFilled");
    await expect(starIcon).toBeVisible();
  }

  async unStarredProject(projectName: string) {
    const projectItem = this.gridProjectItem(projectName).first();
    await projectItem.hover();
    const starButton = this.gridProjectStarButton(projectName).first();
    await starButton.click();
  }

  async verifyUnStarredProject(specialProjectName: string) {
    const projectItem = this.gridProjectItem(specialProjectName).first();
    await projectItem.hover();
    const starButton = this.gridProjectStarButton(specialProjectName).first();
    const starIcon = starButton.getByTestId("icon-star");
    await expect(starIcon).toBeVisible();
  }
  starredProjectNameMenuBar(projectName: string): Locator {
    return this.page.locator(
      `xpath=//div[contains(@class, 'css-1ez7fby')]//div[contains(@title, "${projectName}")]`
    );
  }
  // async goToProjectPage(projectName: string) {
  //   const projectRow = this.page.getByTestId(
  //     `project-grid-item-${projectName}`
  //   );
  //   await projectRow.first().dblclick();
  // }

  // ...existing code...

  async goToProjectPage(projectName: string) {
    const projectRow = this.page.getByTestId(
      `project-grid-item-${projectName}`
    );
    let attempts = 0;
    while (attempts < 3) {
      await projectRow.first().dblclick();
      try {
        await this.page
          .locator('[data-testid="editor-map-scene-item"]')
          .first()
          .waitFor({ state: "visible", timeout: 10000 });
        return;
      } catch {
        attempts++;
        if (attempts === 3) {
          throw new Error(
            "Scene items did not become visible after 3 attempts."
          );
        }
      }
    }
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
