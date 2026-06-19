import { Locator, Page, expect } from "@playwright/test";

export class ProjectSettingsPage {
  wrapper: Locator;
  navbar: Locator;
  mainSection: Locator;
  sidebar: Locator;
  sidebarVersion: Locator;
  tabGeneral: Locator;
  tabReadme: Locator;
  tabLicense: Locator;
  tabStory: Locator;
  tabPublic: Locator;
  tabAssets: Locator;
  tabPlugins: Locator;
  contentGeneral: Locator;
  contentReadme: Locator;
  contentLicense: Locator;
  contentStory: Locator;
  contentPublic: Locator;
  contentAssets: Locator;
  generalSettingsTitle: Locator;
  projectNameLabel: Locator;
  projectNameInput: Locator;
  projectAliasLabel: Locator;
  projectAliasInput: Locator;
  projectDescriptionLabel: Locator;
  projectDescriptionInput: Locator;
  thumbnailLabel: Locator;
  thumbnailChooseButton: Locator;
  thumbnailUploadButton: Locator;
  dangerZoneTitle: Locator;
  removeProjectTitle: Locator;
  removeProjectDescription: Locator;
  moveToRecycleBinButton: Locator;
  readmeEditingTitle: Locator;
  readmeEditTab: Locator;
  readmePreviewTab: Locator;
  readmeSaveButton: Locator;
  readmeTextarea: Locator;
  licenseEditingTitle: Locator;
  licenseEditTab: Locator;
  licensePreviewTab: Locator;
  licenseSaveButton: Locator;
  licenseChooseTemplateButton: Locator;
  licenseTextarea: Locator;
  licenseTemplateModalTitle: Locator;
  licenseTemplateSelect: Locator;
  licenseTemplateApplyButton: Locator;
  licenseTemplateCancelButton: Locator;
  storyPanelSettingsTitle: Locator;
  storyPanelPositionSelect: Locator;
  storyBackgroundColorField: Locator;
  publicInfoTitle: Locator;
  publicTitleInput: Locator;
  publicBasicAuthTitle: Locator;
  publicEnableBasicAuthSwitch: Locator;
  publicGoogleAnalyticsTitle: Locator;
  publicEnableGASwitch: Locator;
  publicAliasSettingTitle: Locator;

  constructor(private page: Page) {
    this.wrapper = this.page.getByTestId("project-settings-wrapper");
    this.navbar = this.page.getByTestId("project-settings-navbar");
    this.mainSection = this.page.getByTestId("project-settings-main-section");
    this.sidebar = this.page.getByTestId("project-settings-sidebar");
    this.sidebarVersion = this.page.getByTestId(
      "project-settings-sidebar-version"
    );
    this.tabGeneral = this.page.getByTestId("project-settings-tab-general");
    this.tabReadme = this.page.getByTestId("project-settings-tab-readme");
    this.tabLicense = this.page.getByTestId("project-settings-tab-license");
    this.tabStory = this.page.getByTestId("project-settings-tab-story");
    this.tabPublic = this.page.getByTestId("project-settings-tab-public");
    this.tabAssets = this.page.getByTestId("project-settings-tab-assets");
    this.tabPlugins = this.page.getByTestId("project-settings-tab-plugins");
    this.contentGeneral = this.page.getByTestId(
      "project-settings-content-general"
    );
    this.contentReadme = this.page.getByTestId(
      "project-settings-content-readme"
    );
    this.contentLicense = this.page.getByTestId(
      "project-settings-content-license"
    );
    this.contentStory = this.page.getByTestId(
      "project-settings-content-story"
    );
    this.contentPublic = this.page.getByTestId(
      "project-settings-content-public"
    );
    this.contentAssets = this.page.getByTestId(
      "project-settings-content-assets"
    );
    this.generalSettingsTitle = this.page.getByText("Basic settings", {
      exact: true
    });
    this.projectNameLabel = this.page.getByText("Project Name", {
      exact: true
    });
    this.projectNameInput = this.page
      .locator('[data-testid="project-settings-content-general"]')
      .getByRole("textbox")
      .first();
    this.projectAliasLabel = this.page.getByText("Project Alias *");
    this.projectAliasInput = this.page
      .locator('[data-testid="project-settings-content-general"]')
      .getByRole("textbox")
      .nth(1);
    this.projectDescriptionLabel = this.page
      .locator('[data-testid="project-settings-content-general"]')
      .getByText("Description", { exact: true });
    this.projectDescriptionInput = this.page
      .locator('[data-testid="project-settings-content-general"]')
      .getByRole("textbox")
      .nth(2);
    this.thumbnailLabel = this.page.getByText("Thumbnail", { exact: true });
    this.thumbnailChooseButton = this.page.getByRole("button", {
      name: "Choose"
    });
    this.thumbnailUploadButton = this.page.getByRole("button", {
      name: "Upload"
    });
    this.dangerZoneTitle = this.page.getByText("Danger Zone", {
      exact: true
    });
    this.removeProjectTitle = this.page.getByText("Remove this project");
    this.removeProjectDescription = this.page.getByText(
      "This process will move this project to Recycle bin."
    );
    this.moveToRecycleBinButton = this.page
      .getByRole("button", { name: "Move to Recycle Bin" })
      .last();
    this.readmeEditingTitle = this.page.getByText("README Editing");
    this.readmeEditTab = this.page.getByText("Edit", { exact: true });
    this.readmePreviewTab = this.page.getByText("Preview", { exact: true });
    this.readmeSaveButton = this.page.getByRole("button", {
      name: "Save README"
    });
    this.readmeTextarea = this.page.locator("textarea").first();
    this.licenseEditingTitle = this.page.getByText("License Editing");
    this.licenseEditTab = this.page.getByText("Edit", { exact: true });
    this.licensePreviewTab = this.page.getByText("Preview", { exact: true });
    this.licenseSaveButton = this.page.getByRole("button", {
      name: "Save License"
    });
    this.licenseChooseTemplateButton = this.page.getByRole("button", {
      name: "Choose a template"
    });
    this.licenseTextarea = this.page.locator("textarea").first();
    this.licenseTemplateModalTitle = this.page
      .getByText("Choose a template")
      .last();
    this.licenseTemplateSelect = this.page.getByTestId("select-input");
    this.licenseTemplateApplyButton = this.page.getByRole("button", {
      name: "Apply"
    });
    this.licenseTemplateCancelButton = this.page
      .getByRole("button", { name: "Cancel" })
      .last();
    this.storyPanelSettingsTitle = this.page.getByText(
      "Story Panel settings"
    );
    this.storyPanelPositionSelect = this.page.getByTestId("select-input");
    this.storyBackgroundColorField = this.page
      .getByText("Background Color")
      .first();
    this.publicInfoTitle = this.page.getByText("Published page settings");
    this.publicTitleInput = this.page
      .locator('[data-testid="project-settings-content-public"]')
      .getByText("Title")
      .first();
    this.publicBasicAuthTitle = this.page.getByText("Basic Authorization", {
      exact: true
    });
    this.publicEnableBasicAuthSwitch = this.page.getByText(
      "Enable Basic Authorization"
    );
    this.publicGoogleAnalyticsTitle = this.page.getByText(
      "Google Analytics",
      { exact: true }
    );
    this.publicEnableGASwitch = this.page.getByText(
      "Enable Google Analytics"
    );
    this.publicAliasSettingTitle = this.page.getByText("Alias Setting");
  }

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
