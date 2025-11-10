import { Locator, Page } from "@playwright/test";

export class LoginPage {
  appTitle: Locator = this.page.locator(
    'div#custom-prompt-logo[title="reearth-dev"]'
  );
  emailInput: Locator = this.page.locator(`input[name="username"]`);
  continueButton: Locator = this.page.getByRole("button", { name: "Continue" });
  passwordInput: Locator = this.page.locator(`input[name="password"]`);
  loginButton: Locator = this.page.getByRole("button", { name: "Log In" });
  errorMessageUsername: Locator = this.page.getByRole("alert", {
    name: /Username can't be blank/i
  });
  errorMessagePassword: Locator = this.page.locator(
    "#auth0-lock-error-msg-username .auth0-lock-error-invalid-hint"
  );
  forgotPasswordLink: Locator = this.page.getByRole("link", {
    name: /Don't remember your password/i
  });
  forgotPasswordError: Locator = this.page.locator(
    "#auth0-lock-error-msg-password .auth0-lock-error-invalid-hint"
  );
  loginErrorMessage: Locator = this.page.locator("#error-element-password");
  editEmailLink: Locator = this.page.getByRole("link", { name: "Edit" });
  logoutCTA: Locator = this.page.getByTestId("header-user-menu-logout");

  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.continueButton.first().click();
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await this.continueButton.click();
  }
}
