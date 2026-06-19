import { Locator, Page, expect } from "@playwright/test";

export class AccountSettingsPage {
  innerPage: Locator;
  accountTitle: Locator;
  nameField: Locator;
  emailField: Locator;
  passwordField: Locator;
  languageField: Locator;
  changePasswordButton: Locator;
  languageSelector: Locator;
  passwordModalTitle: Locator;
  newPasswordInput: Locator;
  confirmPasswordInput: Locator;
  passwordModalCancelButton: Locator;
  passwordModalChangeButton: Locator;
  passwordMismatchWarning: Locator;
  accountTab: Locator;
  workspaceTab: Locator;

  constructor(private page: Page) {
    this.innerPage = this.page.getByTestId("inner-page");
    this.accountTitle = this.page
      .getByTestId("inner-page")
      .getByText("Account", { exact: true });
    this.nameField = this.page
      .getByTestId("inner-page")
      .getByText("Name", { exact: true });
    this.emailField = this.page
      .getByTestId("inner-page")
      .getByText("Email address");
    this.passwordField = this.page
      .getByTestId("inner-page")
      .getByText("Password", { exact: true });
    this.languageField = this.page
      .getByTestId("inner-page")
      .getByText("Language", { exact: true });
    this.changePasswordButton = this.page.getByTestId("change-password-button");
    this.languageSelector = this.page.getByTestId("select-input");
    this.passwordModalTitle = this.page.getByText("Change password");
    this.newPasswordInput = this.page
      .getByRole("dialog")
      .locator('input[type="password"]')
      .first();
    this.confirmPasswordInput = this.page
      .getByRole("dialog")
      .locator('input[type="password"]')
      .last();
    this.passwordModalCancelButton = this.page
      .getByRole("button", { name: "Cancel" })
      .last();
    this.passwordModalChangeButton = this.page.getByRole("button", {
      name: "Change password"
    });
    this.passwordMismatchWarning = this.page.getByText(
      "Passwords need to match"
    );
    this.accountTab = this.page.getByRole("link", { name: "Account" });
    this.workspaceTab = this.page.getByRole("link", { name: "Workspace" });
  }

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
