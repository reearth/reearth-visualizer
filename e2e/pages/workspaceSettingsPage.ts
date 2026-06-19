import { Locator, Page, expect } from "@playwright/test";

export class WorkspaceSettingsPage {
  workspaceTitle: Locator;
  workspaceNameField: Locator;
  dangerZoneTitle: Locator;
  deleteWorkspaceButton: Locator;
  deleteModalTitle: Locator;
  deleteModalInput: Locator;
  deleteModalConfirmButton: Locator;
  deleteModalCancelButton: Locator;
  warningModalTitle: Locator;
  warningModalOkButton: Locator;
  accountTab: Locator;
  workspaceTab: Locator;

  constructor(private page: Page) {
    this.workspaceTitle = this.page.getByText("Workspace", { exact: true });
    this.workspaceNameField = this.page.getByText("Workspace Name");
    this.dangerZoneTitle = this.page.getByText("Danger Zone");
    this.deleteWorkspaceButton = this.page.getByRole("button", {
      name: "Delete workspace"
    });
    this.deleteModalTitle = this.page.getByText("Delete workspace");
    this.deleteModalInput = this.page
      .getByRole("dialog")
      .locator("input")
      .last();
    this.deleteModalConfirmButton = this.page.getByRole("button", {
      name: "I am sure I want to delete this workspace"
    });
    this.deleteModalCancelButton = this.page
      .getByRole("button", { name: "Cancel" })
      .last();
    this.warningModalTitle = this.page.getByText("Delete workspace");
    this.warningModalOkButton = this.page.getByRole("button", {
      name: "Ok"
    });
    this.accountTab = this.page.getByRole("link", { name: "Account" });
    this.workspaceTab = this.page.getByRole("link", { name: "Workspace" });
  }

  async verifyPageLoaded() {
    await expect(this.workspaceNameField).toBeVisible();
  }
}
