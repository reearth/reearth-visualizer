import { Locator, Page } from "@playwright/test";

export class DashBoardPage {
  projects: Locator = this.page.getByRole("link", {
    name: /Projects/i
  });

  assets: Locator = this.page.getByRole("link", {
    name: /Assets/i
  });

  recycleBin: Locator = this.page.getByRole("link", {
    name: /Recycle bin/i
  });

  starred: Locator = this.page.getByText(/Starred/i);

  pluginPlayground: Locator = this.page.getByRole("link", {
    name: /Plugin Playground/i
  });

  documentation: Locator = this.page.getByRole("link", {
    name: /Documentation/i
  });

  community: Locator = this.page.getByRole("link", {
    name: /Community/i
  });

  userProfileDropdown: Locator = this.page.locator("div.css-1yc53zh svg");

  switchWorkSpace: Locator = this.page.getByText(/Switch workspace/i);

  workSpaceSettings: Locator = this.page.getByText(/Workspace settings/i);

  newWorkspace: Locator = this.page.getByText(/New workspace/i);

  accountSettings: Locator = this.page.getByText(/Account settings/i);

  logOutCTA: Locator = this.page.getByText(/Log out/i);

  constructor(private page: Page) {}

  async logOut() {
    await this.userProfileDropdown.click();
    await this.logOutCTA.click();
  }
}
