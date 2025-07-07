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
    return this.page.getByTestId(`project-grid-item-star-btn-${projectName}`);
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
  projectNameInput: Locator = this.page.locator('input[placeholder="Text"]');
  descriptionLabel: Locator = this.page.getByText("Description");
  descriptionTextarea: Locator = this.page.locator(
    'textarea[placeholder="Write down your content"]'
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
