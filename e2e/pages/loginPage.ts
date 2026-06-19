import { Locator, Page } from "@playwright/test";

export class LoginPage {
  appTitle: Locator;
  emailInput: Locator;
  continueButton: Locator;
  passwordInput: Locator;
  loginButton: Locator;
  lockWidgetContainer: Locator;
  lockUsernameInput: Locator;
  lockPasswordInput: Locator;
  lockSubmitButton: Locator;
  errorMessageUsername: Locator;
  errorMessagePassword: Locator;
  forgotPasswordLink: Locator;
  forgotPasswordError: Locator;
  loginErrorMessage: Locator;
  editEmailLink: Locator;
  logoutCTA: Locator;

  constructor(private page: Page) {
    this.appTitle = this.page.locator(
      'div#custom-prompt-logo[title="reearth-dev"]'
    );
    this.emailInput = this.page.locator(`input[name="username"]`);
    this.continueButton = this.page.getByRole("button", { name: "Continue" });
    this.passwordInput = this.page.locator(`input[name="password"]`);
    this.loginButton = this.page.getByRole("button", { name: "Continue" });
    this.lockWidgetContainer = this.page.locator(
      ".auth0-lock-widget-container"
    );
    this.lockUsernameInput = this.page.locator(
      '.auth0-lock-input-username input[name="username"]'
    );
    this.lockPasswordInput = this.page.locator(
      '.auth0-lock-input-password input[name="password"]'
    );
    this.lockSubmitButton = this.page.locator("button.auth0-lock-submit");
    this.errorMessageUsername = this.page.getByRole("alert", {
      name: /Username can't be blank/i
    });
    this.errorMessagePassword = this.page.locator(
      "#auth0-lock-error-msg-username .auth0-lock-error-invalid-hint"
    );
    this.forgotPasswordLink = this.page.getByRole("link", {
      name: /Don't remember your password/i
    });
    this.forgotPasswordError = this.page.locator(
      "#auth0-lock-error-msg-password .auth0-lock-error-invalid-hint"
    );
    this.loginErrorMessage = this.page.locator("#error-element-password");
    this.editEmailLink = this.page.getByRole("link", { name: "Edit" });
    this.logoutCTA = this.page.getByTestId("header-user-menu-logout");
  }

  async detectFormType() {
    await this.page.waitForTimeout(1000);

    const hasLockWidget = await this.lockWidgetContainer
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (hasLockWidget) {
      return "lock-widget";
    }

    const hasUniversalLogin = await this.appTitle
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (hasUniversalLogin) {
      return "universal-login";
    }

    return "unknown";
  }

  async loginWithLockWidget(email: string, password: string) {
    await this.lockUsernameInput.waitFor({ state: "visible", timeout: 10000 });
    await this.lockUsernameInput.clear();
    await this.lockUsernameInput.fill(email);

    await this.lockPasswordInput.waitFor({ state: "visible" });
    await this.lockPasswordInput.clear();
    await this.lockPasswordInput.fill(password);

    await this.lockSubmitButton.click();
  }

  async loginWithUniversalLogin(email: string, password: string) {
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.continueButton.first().click();

    await this.passwordInput.waitFor({ state: "visible", timeout: 10000 });
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.page.waitForTimeout(10000);

    const formType = await this.detectFormType();

    if (formType === "lock-widget") {
      await this.loginWithLockWidget(email, password);
      return;
    }

    if (formType === "universal-login") {
      await this.loginWithUniversalLogin(email, password);
      return;
    }

    const lockVisible = await this.lockUsernameInput
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (lockVisible) {
      await this.loginWithLockWidget(email, password);
      return;
    }

    const universalVisible = await this.emailInput
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (universalVisible) {
      await this.loginWithUniversalLogin(email, password);
      return;
    }

    throw new Error("Could not detect any known login form");
  }
}
