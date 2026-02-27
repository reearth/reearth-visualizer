import { Locator, Page, expect } from "@playwright/test";

export class WorkspaceSettingsPage {
  constructor(private page: Page) {}
  workspaceTitle: Locator = this.page.getByText("Workspace", { exact: true });
  workspaceNameField: Locator = this.page.getByText("Workspace Name");
  dangerZoneTitle: Locator = this.page.getByText("Danger Zone");
  deleteWorkspaceButton: Locator = this.page.getByRole("button", {
    name: "Delete workspace"
  });

  deleteModalTitle: Locator = this.page.getByText("Delete workspace");
  deleteModalInput: Locator = this.page
    .getByRole("dialog")
    .locator("input")
    .last();
  deleteModalConfirmButton: Locator = this.page.getByRole("button", {
    name: "I am sure I want to delete this workspace"
  });
  deleteModalCancelButton: Locator = this.page
    .getByRole("button", { name: "Cancel" })
    .last();
  warningModalTitle: Locator = this.page.getByText("Delete workspace");
  warningModalOkButton: Locator = this.page.getByRole("button", {
    name: "Ok"
  });
  accountTab: Locator = this.page.getByRole("link", { name: "Account" });
  workspaceTab: Locator = this.page.getByRole("link", { name: "Workspace" });

  async verifyPageLoaded() {
    await expect(this.workspaceNameField).toBeVisible();
  }
}
