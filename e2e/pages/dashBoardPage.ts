import { Locator, Page } from "@playwright/test";

export class DashBoardPage {
  // Sidebar
  projects: Locator;
  recycleBin: Locator;
  pluginPlayground: Locator;
  documentation: Locator;
  community: Locator;

  // Starred Projects
  starredSectionTitle: Locator;
  starredProjectList: Locator;
  firstStarredProject: Locator;
  firstStarredProjectTitle: Locator;

  // Profile Area
  profileWrapper: Locator;
  profileAvatar: Locator;
  profileUsername: Locator;
  profileDropdownButton: Locator;

  // Dropdown Menu Items (from profile menu)
  switchWorkspace: Locator;
  switchWorkspaceSubmenuTrigger: Locator;
  workspaceSettings: Locator;
  membersSettings: Locator;

  // Avatar Menu Items (from avatar popup)
  accountSettings: Locator;
  logOutCTA: Locator;

  // Logo and Footer
  logo: Locator;
  appVersion: Locator;

  constructor(public page: Page) {
    this.projects = this.page.getByTestId("sidebar-tab-projects-link");
    this.recycleBin = this.page.getByTestId("sidebar-tab-bin-link");
    this.pluginPlayground = this.page.getByTestId("sidebar-tab-plugin-link");
    this.documentation = this.page.getByTestId(
      "sidebar-tab-documentation-link"
    );
    this.community = this.page.getByTestId("sidebar-tab-community-link");

    this.starredSectionTitle = this.page.locator(
      '[data-testid="starred-projects-wrapper"] p',
      {
        hasText: "Starred"
      }
    );
    this.starredProjectList = this.page.getByTestId("starred-projects-list");
    this.firstStarredProject = this.page
      .locator('[data-testid^="starred-project-item-"]')
      .first();
    this.firstStarredProjectTitle = this.page
      .locator('[data-testid^="starred-project-item-title-"]')
      .first();

    this.profileWrapper = this.page.getByTestId("profile-wrapper");
    this.profileAvatar = this.page.getByTestId("profile-avatar");
    this.profileUsername = this.page.getByTestId("profile-titleWrapper");
    this.profileDropdownButton = this.page
      .getByTestId("profile-popupWrapper")
      .locator("svg");

    this.switchWorkspace = this.page.getByTestId(
      "profile-switchWorkspace-item-1"
    );
    this.switchWorkspaceSubmenuTrigger = this.page.getByTestId(
      "profile-switchWorkspace-submenu-1-trigger"
    );
    this.workspaceSettings = this.page.getByTestId(
      "workspace-settings-item-2"
    );
    this.membersSettings = this.page.getByTestId("members-settings-item-3");

    this.accountSettings = this.page.getByTestId("avatar-accountSettings-item-1");
    this.logOutCTA = this.page.getByTestId("avatar-signOut-item-2");

    this.logo = this.page.locator('img[src*="LogoWithText.svg"]');
    this.appVersion = this.page.locator("p", { hasText: /Version/i });
  }

  // Action
  async logOut() {
    await this.profileAvatar.click();
    await this.logOutCTA.click();
  }
}
