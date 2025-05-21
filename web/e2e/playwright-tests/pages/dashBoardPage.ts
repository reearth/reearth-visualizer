import { Locator, Page } from "@playwright/test";

export class DashBoardPage {
  constructor(public page: Page) {}
  // Sidebar
  projects: Locator = this.page.getByTestId("sidebar-tab-projects-link");
  recycleBin: Locator = this.page.getByTestId("sidebar-tab-bin-link");
  pluginPlayground: Locator = this.page.getByTestId("sidebar-tab-plugin-link");
  documentation: Locator = this.page.getByTestId(
    "sidebar-tab-documentation-link"
  );
  community: Locator = this.page.getByTestId("sidebar-tab-community-link");

  // Starred Projects
  starredSectionTitle: Locator = this.page.locator(
    '[data-testid="starred-projects-wrapper"] p',
    {
      hasText: "Starred"
    }
  );
  starredProjectList: Locator = this.page.getByTestId("starred-projects-list");
  firstStarredProject: Locator = this.page
    .locator('[data-testid^="starred-project-item-"]')
    .first();
  firstStarredProjectTitle: Locator = this.page
    .locator('[data-testid^="starred-project-item-title-"]')
    .first();

  // Profile Area
  profileWrapper: Locator = this.page.getByTestId("profile-wrapper");
  profileAvatar: Locator = this.page.getByTestId("profile-avatar");
  profileUsername: Locator = this.page.getByTestId("profile-titleWrapper");
  profileDropdownButton: Locator = this.page
    .getByTestId("profile-popupWrapper")
    .locator("svg");

  // Dropdown Menu Items (from profile menu)
  switchWorkspace: Locator = this.page.getByTestId(
    "profile-switchWorkspace-item-0"
  );
  switchWorkspaceSubmenuTrigger: Locator = this.page.getByTestId(
    "profile-switchWorkspace-submenu-0-trigger"
  );
  workspaceSettings: Locator = this.page.getByTestId(
    "workspace-settings-item-1"
  );
  newWorkspace: Locator = this.page.getByTestId("add-workspace-item-2");
  accountSettings: Locator = this.page.getByTestId("account-settings-item-3");
  logOutCTA: Locator = this.page.getByTestId("profile-signOut-item-4");

  // Logo and Footer
  logo: Locator = this.page.locator('img[src*="LogoWithText.svg"]');
  appVersion: Locator = this.page.locator("p", { hasText: /Version/i });

  // Action
  async logOut() {
    await this.profileDropdownButton.click();
    await this.logOutCTA.click();
  }
}
