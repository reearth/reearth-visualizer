import { Locator, Page, expect } from "@playwright/test";

export class ProjectSettingsPage {
  constructor(private page: Page) {}
  wrapper: Locator = this.page.getByTestId("project-settings-wrapper");
  navbar: Locator = this.page.getByTestId("project-settings-navbar");
  mainSection: Locator = this.page.getByTestId("project-settings-main-section");
  sidebar: Locator = this.page.getByTestId("project-settings-sidebar");
  sidebarVersion: Locator = this.page.getByTestId(
    "project-settings-sidebar-version"
  );

  tabGeneral: Locator = this.page.getByTestId("project-settings-tab-general");
  tabReadme: Locator = this.page.getByTestId("project-settings-tab-readme");
  tabLicense: Locator = this.page.getByTestId("project-settings-tab-license");
  tabStory: Locator = this.page.getByTestId("project-settings-tab-story");
  tabPublic: Locator = this.page.getByTestId("project-settings-tab-public");
  tabAssets: Locator = this.page.getByTestId("project-settings-tab-assets");
  tabPlugins: Locator = this.page.getByTestId("project-settings-tab-plugins");

  contentGeneral: Locator = this.page.getByTestId(
    "project-settings-content-general"
  );
  contentReadme: Locator = this.page.getByTestId(
    "project-settings-content-readme"
  );
  contentLicense: Locator = this.page.getByTestId(
    "project-settings-content-license"
  );
  contentStory: Locator = this.page.getByTestId(
    "project-settings-content-story"
  );
  contentPublic: Locator = this.page.getByTestId(
    "project-settings-content-public"
  );
  contentAssets: Locator = this.page.getByTestId(
    "project-settings-content-assets"
  );

  generalSettingsTitle: Locator = this.page.getByText("Basic settings", {
    exact: true
  });
  projectNameLabel: Locator = this.page.getByText("Project Name", {
    exact: true
  });
  projectNameInput: Locator = this.page
    .locator('[data-testid="project-settings-content-general"]')
    .getByRole("textbox")
    .first();
  projectAliasLabel: Locator = this.page.getByText("Project Alias *");
  projectAliasInput: Locator = this.page
    .locator('[data-testid="project-settings-content-general"]')
    .getByRole("textbox")
    .nth(1);
  projectDescriptionLabel: Locator = this.page
    .locator('[data-testid="project-settings-content-general"]')
    .getByText("Description", { exact: true });
  projectDescriptionInput: Locator = this.page
    .locator('[data-testid="project-settings-content-general"]')
    .getByRole("textbox")
    .nth(2);
  thumbnailLabel: Locator = this.page.getByText("Thumbnail", { exact: true });
  thumbnailChooseButton: Locator = this.page.getByRole("button", {
    name: "Choose"
  });
  thumbnailUploadButton: Locator = this.page.getByRole("button", {
    name: "Upload"
  });
  dangerZoneTitle: Locator = this.page.getByText("Danger Zone", {
    exact: true
  });
  removeProjectTitle: Locator = this.page.getByText("Remove this project");
  removeProjectDescription: Locator = this.page.getByText(
    "This process will move this project to Recycle bin."
  );
  moveToRecycleBinButton: Locator = this.page
    .getByRole("button", { name: "Move to Recycle Bin" })
    .last();

  // ── README Settings ──
  readmeEditingTitle: Locator = this.page.getByText("README Editing");
  readmeEditTab: Locator = this.page.getByText("Edit", { exact: true });
  readmePreviewTab: Locator = this.page.getByText("Preview", { exact: true });
  readmeSaveButton: Locator = this.page.getByRole("button", {
    name: "Save README"
  });
  readmeTextarea: Locator = this.page.locator("textarea").first();

  // ── License Settings ──
  licenseEditingTitle: Locator = this.page.getByText("License Editing");
  licenseEditTab: Locator = this.page.getByText("Edit", { exact: true });
  licensePreviewTab: Locator = this.page.getByText("Preview", { exact: true });
  licenseSaveButton: Locator = this.page.getByRole("button", {
    name: "Save License"
  });
  licenseChooseTemplateButton: Locator = this.page.getByRole("button", {
    name: "Choose a template"
  });
  licenseTextarea: Locator = this.page.locator("textarea").first();

  // License Template Modal
  licenseTemplateModalTitle: Locator = this.page
    .getByText("Choose a template")
    .last();
  licenseTemplateSelect: Locator = this.page.getByTestId("select-input");
  licenseTemplateApplyButton: Locator = this.page.getByRole("button", {
    name: "Apply"
  });
  licenseTemplateCancelButton: Locator = this.page
    .getByRole("button", { name: "Cancel" })
    .last();

  // ── Story Settings ──
  storyPanelSettingsTitle: Locator = this.page.getByText(
    "Story Panel settings"
  );
  storyPanelPositionSelect: Locator = this.page.getByTestId("select-input");
  storyBackgroundColorField: Locator = this.page
    .getByText("Background Color")
    .first();

  // ── Public Settings ──
  publicInfoTitle: Locator = this.page.getByText("Published page settings");
  publicTitleInput: Locator = this.page
    .locator('[data-testid="project-settings-content-public"]')
    .getByText("Title")
    .first();
  publicBasicAuthTitle: Locator = this.page.getByText("Basic Authorization", {
    exact: true
  });
  publicEnableBasicAuthSwitch: Locator = this.page.getByText(
    "Enable Basic Authorization"
  );
  publicGoogleAnalyticsTitle: Locator = this.page.getByText(
    "Google Analytics",
    { exact: true }
  );
  publicEnableGASwitch: Locator = this.page.getByText(
    "Enable Google Analytics"
  );
  publicAliasSettingTitle: Locator = this.page.getByText("Alias Setting");

  // ── Navigation helpers ──

  async navigateToTab(tabName: string) {
    const tabLocator = this.page.getByTestId(`project-settings-tab-${tabName}`);
    await tabLocator.click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToGeneralTab() {
    await this.tabGeneral.click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToReadmeTab() {
    await this.tabReadme.click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToLicenseTab() {
    await this.tabLicense.click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToStoryTab() {
    await this.tabStory.click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToPublicTab() {
    // Public tab has sub-items (Scene/Story), click to expand then click Scene
    await this.tabPublic.click();
    await this.page.waitForTimeout(500);
    await this.page.getByText("Scene", { exact: true }).click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToAssetsTab() {
    await this.tabAssets.click();
    await this.page.waitForTimeout(1000);
  }

  // Verify all sidebar tabs are visible
  async verifySidebarTabsVisible() {
    await expect(this.tabGeneral).toBeVisible();
    await expect(this.tabReadme).toBeVisible();
    await expect(this.tabLicense).toBeVisible();
    await expect(this.tabStory).toBeVisible();
    await expect(this.tabPublic).toBeVisible();
    await expect(this.tabAssets).toBeVisible();
  }
}
