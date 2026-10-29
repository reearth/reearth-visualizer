import { Locator, Page, expect } from "@playwright/test";

// The "Add from URL" and "Add from Value" modals opened from the New Layer
// menu (see ProjectScreenPage for the menu itself).
export class DataSourceManagerPage {
  urlModal: Locator;
  urlInput: Locator;
  urlFormatSelect: Locator;
  urlError: Locator;
  urlChecking: Locator;
  csvLatColumnInput: Locator;
  csvLngColumnInput: Locator;
  urlSubmitButton: Locator;
  urlCancelButton: Locator;
  valueModal: Locator;
  valueInput: Locator;
  valueFormatSelect: Locator;
  valueError: Locator;
  valueSubmitButton: Locator;
  valueCancelButton: Locator;

  constructor(private page: Page) {
    this.urlModal = this.page.getByTestId("url-layer-creator-modal");
    this.urlInput = this.page.getByTestId("url-layer-creator-url");
    this.urlFormatSelect = this.page.getByTestId("url-layer-creator-format");
    this.urlError = this.page.getByTestId("url-layer-creator-error");
    this.urlChecking = this.page.getByTestId("url-layer-creator-checking");
    this.csvLatColumnInput = this.page.getByTestId("url-layer-creator-lat");
    this.csvLngColumnInput = this.page.getByTestId("url-layer-creator-lng");
    this.urlSubmitButton = this.page.getByTestId("url-layer-creator-submit");
    this.urlCancelButton = this.page.getByTestId("url-layer-creator-cancel");
    this.valueModal = this.page.getByTestId("value-layer-creator-modal");
    this.valueInput = this.page.getByTestId("value-layer-creator-value");
    this.valueFormatSelect = this.page.getByTestId(
      "value-layer-creator-format"
    );
    this.valueError = this.page.getByTestId("value-layer-creator-error");
    this.valueSubmitButton = this.page.getByTestId(
      "value-layer-creator-submit"
    );
    this.valueCancelButton = this.page.getByTestId(
      "value-layer-creator-cancel"
    );
  }

  private async selectFormat(select: Locator, format: string) {
    await select.click();
    await this.page.getByRole("option", { name: format, exact: true }).click();
  }

  // Serves `body` for `url` from the browser's fetch, so URL validation can be
  // tested without depending on an external host. The URL check is a
  // cross-origin request, hence the CORS header.
  async mockUrl(
    url: string | RegExp,
    { status = 200, body = "" }: { status?: number; body?: string } = {}
  ) {
    await this.page.route(url, (route) =>
      route.fulfill({
        status,
        body,
        headers: { "Access-Control-Allow-Origin": "*" }
      })
    );
  }

  // Leaving the field validates the URL against the format inferred from its
  // extension (if any).
  async enterUrl(url: string) {
    await this.urlInput.fill(url);
    await this.urlInput.blur();
  }

  async selectUrlFormat(format: string) {
    await this.selectFormat(this.urlFormatSelect, format);
  }

  // Leaving the field validates the value, detecting the format if none is
  // selected.
  async enterValue(value: string) {
    await this.valueInput.fill(value);
    await this.valueInput.blur();
  }

  async selectValueFormat(format: string) {
    await this.selectFormat(this.valueFormatSelect, format);
  }

  // Selecting the format validates the URL (client checks, then a fetch from
  // the browser); Add is enabled only once that passes.
  async addFromUrl(url: string, format: string) {
    await expect(this.urlModal).toBeVisible();
    await this.urlInput.fill(url);
    await this.selectFormat(this.urlFormatSelect, format);
    await expect(this.urlSubmitButton).toBeEnabled();
    await this.urlSubmitButton.click();
  }

  // Leaving the field detects the format from the value and validates it.
  async addFromValue(value: string) {
    await expect(this.valueModal).toBeVisible();
    await this.valueInput.fill(value);
    await this.valueInput.blur();
    await expect(this.valueSubmitButton).toBeEnabled();
    await this.valueSubmitButton.click();
  }

  async cancelUrl() {
    await this.urlCancelButton.click();
    await expect(this.urlModal).not.toBeVisible({ timeout: 10_000 });
  }

  async cancelValue() {
    await this.valueCancelButton.click();
    await expect(this.valueModal).not.toBeVisible({ timeout: 10_000 });
  }
}
