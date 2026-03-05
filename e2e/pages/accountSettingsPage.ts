import { Locator, Page, expect } from "@playwright/test";

export class AccountSettingsPage {
  constructor(private page: Page) {}
  innerPage: Locator = this.page.getByTestId("inner-page");
  accountTitle: Locator = this.page
    .getByTestId("inner-page")
    .getByText("Account", { exact: true });
  nameField: Locator = this.page
    .getByTestId("inner-page")
    .getByText("Name", { exact: true });
  emailField: Locator = this.page
    .getByTestId("inner-page")
    .getByText("Email address");
  passwordField: Locator = this.page
    .getByTestId("inner-page")
    .getByText("Password", { exact: true });
  languageField: Locator = this.page
    .getByTestId("inner-page")
    .getByText("Language", { exact: true });
  changePasswordButton: Locator = this.page.getByTestId(
    "change-password-button"
  );
  languageSelector: Locator = this.page.getByTestId("select-input");
  passwordModalTitle: Locator = this.page.getByText("Change password");
  newPasswordInput: Locator = this.page
    .getByRole("dialog")
    .locator('input[type="password"]')
    .first();
  confirmPasswordInput: Locator = this.page
    .getByRole("dialog")
    .locator('input[type="password"]')
    .last();
  passwordModalCancelButton: Locator = this.page
    .getByRole("button", { name: "Cancel" })
    .last();
  passwordModalChangeButton: Locator = this.page.getByRole("button", {
    name: "Change password"
  });
  passwordMismatchWarning: Locator = this.page.getByText(
    "Passwords need to match"
  );
  accountTab: Locator = this.page.getByRole("link", { name: "Account" });
  workspaceTab: Locator = this.page.getByRole("link", { name: "Workspace" });
  async verifyPageLoaded() {
    await expect(this.innerPage).toBeVisible();
    await expect(this.nameField).toBeVisible();
    await expect(this.emailField).toBeVisible();
  }
  async openPasswordModal() {
    await this.changePasswordButton.click();
    await this.page.waitForTimeout(500);
  }
}
