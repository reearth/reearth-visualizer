import { Locator, Page, expect } from "@playwright/test";

export class MembersPage {
  searchInput: Locator;
  inviteButton: Locator;
  userNameHeader: Locator;
  emailHeader: Locator;
  roleHeader: Locator;
  noMemberMessage: Locator;
  addMemberModalTitle: Locator;
  addMemberSearchInput: Locator;
  addMemberAddButton: Locator;
  addMemberCancelButton: Locator;
  userNotFoundWarning: Locator;
  userExistsWarning: Locator;
  updateRoleModalTitle: Locator;
  updateRoleUpdateButton: Locator;
  updateRoleCancelButton: Locator;
  deleteMemberRemoveButton: Locator;
  deleteMemberCancelButton: Locator;
  changeRoleMenuItem: Locator;
  removeMenuItem: Locator;

  constructor(private page: Page) {
    this.searchInput = this.page.getByPlaceholder(
      "Search member by name or email"
    );
    this.inviteButton = this.page.getByRole("button", {
      name: "invite user"
    });
    this.userNameHeader = this.page.getByText("User Name");
    this.emailHeader = this.page.getByText("Email");
    this.roleHeader = this.page.getByText("Role");
    this.noMemberMessage = this.page.getByText(
      "No Member match your search."
    );
    this.addMemberModalTitle = this.page.getByText("Add a team member");
    this.addMemberSearchInput = this.page.getByPlaceholder("name@reearth.io");
    this.addMemberAddButton = this.page
      .getByRole("button", { name: "Add" })
      .last();
    this.addMemberCancelButton = this.page
      .getByRole("button", { name: "Cancel" })
      .last();
    this.userNotFoundWarning = this.page.getByText("Can't find the user");
    this.userExistsWarning = this.page.getByText(
      "User already joined this workspace."
    );
    this.updateRoleModalTitle = this.page.getByText("Update Member Role");
    this.updateRoleUpdateButton = this.page.getByRole("button", {
      name: "Update"
    });
    this.updateRoleCancelButton = this.page
      .getByRole("button", { name: "Cancel" })
      .last();
    this.deleteMemberRemoveButton = this.page.getByRole("button", {
      name: "Remove"
    });
    this.deleteMemberCancelButton = this.page
      .getByRole("button", { name: "Cancel" })
      .last();
    this.changeRoleMenuItem = this.page.getByText("Change Role");
    this.removeMenuItem = this.page.getByText("Remove").last();
  }

  getMemberRows(): Locator {
    return this.page.locator(
      'button[appearance="simple"] >> xpath=ancestor::div[contains(@style, "grid")]'
    );
  }

  getMemberByName(name: string): Locator {
    return this.page.locator("div", { hasText: name }).filter({
      has: this.page.locator('button[icon="dotsThreeVertical"]')
    });
  }

  // Actions
  async openInviteModal() {
    await this.inviteButton.click();
    await expect(this.addMemberModalTitle).toBeVisible();
  }

  async searchMembers(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.fill("");
  }

  async openMemberContextMenu(memberName: string) {
    const memberRow = this.page
      .locator("div")
      .filter({ hasText: new RegExp(`^${memberName.charAt(0)}${memberName}`) })
      .locator('button[appearance="simple"]')
      .first();

    if (await memberRow.isVisible().catch(() => false)) {
      await memberRow.click();
    } else {
      const nameElement = this.page.getByText(memberName, { exact: true });
      const row = nameElement
        .locator("xpath=ancestor::div[contains(@style, 'grid')]")
        .first();
      await row
        .locator("button")
        .filter({ has: this.page.locator('[icon="dotsThreeVertical"]') })
        .click();
    }
  }

  async getMemberCount(): Promise<number> {
    const actionButtons = this.page.locator(
      'button[icon="dotsThreeVertical"], button:has(svg)'
    );
    return await actionButtons.count();
  }

  async isMemberVisible(memberName: string): Promise<boolean> {
    return await this.page
      .getByText(memberName, { exact: true })
      .isVisible()
      .catch(() => false);
  }
}
