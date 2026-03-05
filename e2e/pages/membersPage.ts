import { Locator, Page, expect } from "@playwright/test";

export class MembersPage {
  constructor(private page: Page) {}
  searchInput: Locator = this.page.getByPlaceholder(
    "Search member by name or email"
  );
  inviteButton: Locator = this.page.getByRole("button", {
    name: "invite user"
  });
  userNameHeader: Locator = this.page.getByText("User Name");
  emailHeader: Locator = this.page.getByText("Email");
  roleHeader: Locator = this.page.getByText("Role");
  noMemberMessage: Locator = this.page.getByText(
    "No Member match your search."
  );
  addMemberModalTitle: Locator = this.page.getByText("Add a team member");
  addMemberSearchInput: Locator = this.page.getByPlaceholder("name@reearth.io");
  addMemberAddButton: Locator = this.page
    .getByRole("button", { name: "Add" })
    .last();
  addMemberCancelButton: Locator = this.page
    .getByRole("button", { name: "Cancel" })
    .last();
  userNotFoundWarning: Locator = this.page.getByText("Can't find the user");
  userExistsWarning: Locator = this.page.getByText(
    "User already joined this workspace."
  );

  updateRoleModalTitle: Locator = this.page.getByText("Update Member Role");
  updateRoleUpdateButton: Locator = this.page.getByRole("button", {
    name: "Update"
  });
  updateRoleCancelButton: Locator = this.page
    .getByRole("button", { name: "Cancel" })
    .last();
  deleteMemberRemoveButton: Locator = this.page.getByRole("button", {
    name: "Remove"
  });
  deleteMemberCancelButton: Locator = this.page
    .getByRole("button", { name: "Cancel" })
    .last();

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

  // Context menu items
  changeRoleMenuItem: Locator = this.page.getByText("Change Role");
  removeMenuItem: Locator = this.page.getByText("Remove").last();

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
