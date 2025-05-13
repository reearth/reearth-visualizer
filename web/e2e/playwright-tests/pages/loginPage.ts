import { Locator, Page } from "@playwright/test";

export class LoginPage {
  appTitle: Locator = this.page.locator(
    ".auth0-lock-header-welcome .auth0-lock-name"
  );
  emailInput: Locator = this.page.getByRole("textbox", { name: "User name" });
  passwordInput: Locator = this.page.getByLabel("Password");
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
  loginErrorMessage: Locator = this.page.locator(
    'span:text("Wrong username or password.")'
  );

  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getUsernameError() {
    return this.errorMessageUsername.textContent();
  }

  async getPasswordError() {
    return this.errorMessagePassword.textContent();
  }
}
