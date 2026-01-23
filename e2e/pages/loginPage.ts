import { Locator, Page } from "@playwright/test";

export class LoginPage {
  appTitle: Locator = this.page.locator(
    'div#custom-prompt-logo[title="reearth-dev"]'
  );
  emailInput: Locator = this.page.locator(`input[name="username"]`);
  continueButton: Locator = this.page.getByRole("button", { name: "Continue" });
  passwordInput: Locator = this.page.locator(`input[name="password"]`);
  loginButton: Locator = this.page.getByRole("button", { name: "Continue" });

  lockWidgetContainer: Locator = this.page.locator(
    ".auth0-lock-widget-container"
  );
  lockUsernameInput: Locator = this.page.locator(
    '.auth0-lock-input-username input[name="username"]'
  );
  lockPasswordInput: Locator = this.page.locator(
    '.auth0-lock-input-password input[name="password"]'
  );
  lockSubmitButton: Locator = this.page.locator("button.auth0-lock-submit");

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
