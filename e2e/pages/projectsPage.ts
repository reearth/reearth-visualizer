import { Locator, Page, expect } from "@playwright/test";

export class ProjectsPage {
  newProjectButton: Locator;
  importButton: Locator;
  importFileInput: Locator;
  searchProjectInput: Locator;
  searchButton: Locator;
  sortLabel: Locator;
  sortDropdown: Locator;
  searchResultBreadcrumb: Locator;
  allProjectsBreadcrumb: Locator;
  emptyContent: Locator;
  gridViewToggle: Locator;
  listViewToggle: Locator;
  gridLayoutButton: Locator;
  listLayoutButton: Locator;
  columnHeaderProjectName: Locator;
  columnHeaderUpdatedAt: Locator;
  columnHeaderCreatedAt: Locator;
  allProjectsHeader: Locator;
  assetMigrationTitle: Locator;
  projectDates: Locator;
  firstProjectOptions: Locator;
  favoriteButton: Locator;
  modalTitle: Locator;
  projectNameLabel: Locator;
  projectNameInput: Locator;
  projectAliasLabel: Locator;
  projectAliasInput: Locator;
  descriptionLabel: Locator;
  descriptionTextarea: Locator;
  cancelButton: Locator;
  applyButton: Locator;
  noticeBanner: Locator;
  projectFavrtButton: Locator;
  starIcon: Locator;
  starredSection: Locator;
  renameButton: Locator;
  projectSettingLink: Locator;
  projectAssetsLink: Locator;
  exportButton: Locator;
  moveToRecycleBinButton: Locator;
  popUpCancelButton: Locator;
  popUpRemoveButton: Locator;
  renameMenuItem: Locator;
  exportMenuItem: Locator;
  projectSettingMenuItem: Locator;
  projectAssetsMenuItem: Locator;

  constructor(private page: Page) {
    this.newProjectButton = this.page.getByTestId("create-project-btn");
    this.importButton = this.page.getByTestId("import-project-btn");
    this.importFileInput = this.page.getByTestId("import-project-file-input");
    this.searchProjectInput = this.page.getByPlaceholder("Search project");
    this.searchButton = this.page.getByTestId("projects-manager-header")
      .locator('button:has(svg)').last();
    this.sortLabel = this.page.locator("p", { hasText: "Sort:" });
    this.sortDropdown = this.page.getByTestId("select-input");
    this.searchResultBreadcrumb = this.page.getByTestId(
      "breadcrumb-search-result"
    );
    this.allProjectsBreadcrumb = this.page.getByTestId(
      "breadcrumb-all-projects"
    );
    this.emptyContent = this.page.getByTestId("projects-empty-content");
    this.gridViewToggle = this.page.getByTestId("icon-button-grid");
    this.listViewToggle = this.page.getByTestId("icon-button-list");
    this.gridLayoutButton = this.page.getByTestId("icon-button-grid");
    this.listLayoutButton = this.page.getByTestId("icon-button-list");
    this.columnHeaderProjectName = this.page.getByTestId(
      "projects-list-name-col"
    );
    this.columnHeaderUpdatedAt = this.page.getByTestId(
      "projects-list-updated-col"
    );
    this.columnHeaderCreatedAt = this.page.getByTestId(
      "projects-list-created-col"
    );
    this.allProjectsHeader = this.page.locator(
      '[data-testid="projects-breadcrumb-container"] p',
      { hasText: "All projects" }
    );
    this.assetMigrationTitle = this.page.locator(
      '[data-testid^="project-list-item-title-"]',
      { hasText: "Test_Asset_migration" }
    );
    this.projectDates = this.page.locator("div.css-9u2lx8 p");
    this.firstProjectOptions = this.page
      .locator('[data-testid^="project-list-item-menu-btn-"]')
      .first();
    this.favoriteButton = this.page.locator(
      'button.css-19yctgj svg path[d*="M14.9479 6.0882"]'
    );
    this.modalTitle = this.page.getByText("Create new project");
    this.projectNameLabel = this.page.getByText("Project Name *");
    this.projectNameInput = this.page.getByTestId("project-name-input");
    this.projectAliasLabel = this.page.getByText("Project Alias *");
    this.projectAliasInput = this.page.getByTestId("project-alias-input");
    this.descriptionLabel = this.page.getByText("Description");
    this.descriptionTextarea = this.page.getByTestId(
      "project-description-input"
    );
    this.cancelButton = this.page.getByTestId(
      "project-creator-cancel-btn"
    );
    this.applyButton = this.page.getByTestId("project-creator-apply-btn");
    this.noticeBanner = this.page.getByText("Notice");
    this.projectFavrtButton = this.page
      .locator('[data-testid^="project-list-item-star-btn-"]')
      .first();
    this.starIcon = this.page.locator('svg[color="#f1c21b"]');
    this.starredSection = this.page.locator(
      '[data-testid="starred-projects-wrapper"] p',
      { hasText: "Starred" }
    );
    this.renameButton = this.page.getByText("Rename");
    this.projectSettingLink = this.page.getByRole("link", {
      name: "Project Setting"
    });
    this.projectAssetsLink = this.page.getByRole("link", {
      name: "Project Assets"
    });
    this.exportButton = this.page.getByText("Export");
    this.moveToRecycleBinButton = this.page.getByText("Move to Recycle Bin");
    this.popUpCancelButton = this.page.getByRole("button", {
      name: "Cancel"
    });
    this.popUpRemoveButton = this.page.getByRole("button", {
      name: "Remove"
    });
    this.renameMenuItem = this.page.getByText("Rename");
    this.exportMenuItem = this.page.getByText("Export");
    this.projectSettingMenuItem = this.page.getByRole("link", {
      name: "Project Setting"
    });
    this.projectAssetsMenuItem = this.page.getByRole("link", {
      name: "Project Assets"
    });
  }

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
    await this.page.waitForTimeout(10000);
    await this.descriptionTextarea.fill(description);
    await expect(this.applyButton).toBeEnabled();
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

  // List View - Project Row
  listProjectItem(projectName: string): Locator {
    return this.page.getByTestId(`project-list-item-${projectName}`);
  }
  listProjectTitle(projectName: string): Locator {
    return this.page.getByTestId(`project-list-item-title-${projectName}`);
  }
  listProjectMenuButton(projectName: string): Locator {
    return this.page.getByTestId(`project-list-item-menu-btn-${projectName}`);
  }
  listProjectStarButton(projectName: string): Locator {
    return this.page
      .getByTestId(`project-list-item-star-btn-wrapper-${projectName}`)
      .locator("button");
  }
  listProjectUpdated(projectName: string): Locator {
    // Note: data-testid on Typography is NOT forwarded to DOM,
    // so we use the parent TimeCol's -col- test ID instead
    return this.page.getByTestId(
      `project-list-item-updated-col-${projectName}`
    );
  }
  listProjectCreated(projectName: string): Locator {
    return this.page.getByTestId(
      `project-list-item-created-col-${projectName}`
    );
  }

  // Grid View - Rename Input (shown during inline editing)
  // Note: TextInput uses dataTestid prop (camelCase), not data-testid,
  // so the passed data-testid is ignored. Locate the textbox within the card instead.
  gridProjectTitleInput(projectName: string): Locator {
    return this.page
      .getByTestId(`project-grid-item-${projectName}`)
      .getByRole("textbox");
  }

  // List View - Rename Input (shown during inline editing)
  // Note: TextInput uses dataTestid prop (camelCase), not data-testid
  listProjectTitleInput(projectName: string): Locator {
    return this.page
      .getByTestId(`project-list-item-${projectName}`)
      .getByRole("textbox");
  }

  // Search actions
  async searchProject(searchTerm: string) {
    await this.searchProjectInput.fill(searchTerm);
    await this.searchProjectInput.press("Enter");
  }

  async clearSearch() {
    await this.searchProjectInput.fill("");
    await this.searchProjectInput.press("Enter");
  }

  // Sort actions
  async selectSortOption(optionLabel: string) {
    await this.sortDropdown.click();
    await this.page.waitForTimeout(500);
    await this.page
      .getByRole("option", { name: optionLabel })
      .click();
    await this.page.waitForTimeout(2000);
  }

  // Layout actions
  async switchToListView() {
    await this.listLayoutButton.click();
    await this.page.waitForTimeout(500);
  }

  async switchToGridView() {
    await this.gridLayoutButton.click();
    await this.page.waitForTimeout(500);
  }

  // Rename actions
  async renameProject(projectName: string, newName: string) {
    const projectMenuButton = this.gridProjectMenuButton(projectName).first();
    await projectMenuButton.click();
    await this.renameMenuItem.click();
    await this.page.waitForTimeout(500);
    const input = this.gridProjectTitleInput(projectName);
    await input.waitFor({ state: "visible" });
    await input.fill(newName);
    await input.press("Enter");
    await this.page.waitForTimeout(1000);
  }

  // Export actions
  async exportProject(projectName: string) {
    const projectMenuButton = this.gridProjectMenuButton(projectName).first();
    await projectMenuButton.click();
    await this.exportMenuItem.click();
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
