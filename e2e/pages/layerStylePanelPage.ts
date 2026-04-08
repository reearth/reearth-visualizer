import { Locator, Page, expect } from "@playwright/test";

export class LayerStylePanelPage {
  addNewStyleButton: Locator;
  assignStyleButton: Locator;
  interfaceTab: Locator;
  codeTab: Locator;
  nodeListScrollArea: Locator;

  constructor(private page: Page) {
    this.addNewStyleButton = this.page.getByTestId("icon-button-plus");
    this.assignStyleButton = this.page.getByTestId("icon-button-return");
    this.interfaceTab = this.page.getByRole("tab", { name: "Interface" });
    this.codeTab = this.page.getByRole("tab", { name: "Code" });
    this.nodeListScrollArea = this.page.getByTestId("node-list-scroll-area");
  }

  async addPresetStyle(presetName: string) {
    await this.addNewStyleButton.click();
    const menuItem = this.page.locator('[role="menuitem"]', {
      hasText: presetName
    });
    await expect(menuItem).toBeVisible({ timeout: 10_000 });
    await menuItem.click();

    const loader = this.page.getByTestId("loader");
    await this.page.waitForTimeout(500);
    try {
      await loader.waitFor({ state: "visible", timeout: 2_000 });
      await loader.waitFor({ state: "hidden", timeout: 30_000 });
    } catch {
      // Loader may not appear for fast mutations
    }
  }

  getStyleByName(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  async selectStyle(name: string) {
    await this.getStyleByName(name).click();
    await this.page.waitForTimeout(500);
  }

  async renameStyle(currentName: string, newName: string) {
    const styleText = this.getStyleByName(currentName);
    await styleText.click();
    await this.page.waitForTimeout(300);

    const styleEntry = styleText.locator("..").locator("..");
    await styleEntry.getByTestId("icon-button-dotsThreeVertical").click();

    const renameMenuItem = this.page.locator('[role="menuitem"]', {
      hasText: "Rename"
    });
    await expect(renameMenuItem).toBeVisible({ timeout: 10_000 });
    await renameMenuItem.click();
    await this.page.waitForTimeout(1000);

    const renameInput = this.page.locator(`input[value='${currentName}']`);
    await expect(renameInput).toBeVisible({ timeout: 10_000 });
    await renameInput.click();
    await renameInput.fill(newName);
    await this.page.keyboard.press("Enter");

    const loader = this.page.getByTestId("loader");
    await this.page.waitForTimeout(300);
    try {
      await loader.waitFor({ state: "visible", timeout: 2_000 });
      await loader.waitFor({ state: "hidden", timeout: 30_000 });
    } catch {
      // fast mutation
    }
  }

  async deleteStyle(name: string) {
    const styleText = this.getStyleByName(name);
    await styleText.hover();
    await this.page.waitForTimeout(300);

    const styleEntry = styleText.locator("..").locator("..");
    await styleEntry.getByTestId("icon-button-dotsThreeVertical").click();

    const deleteMenuItem = this.page.locator('[role="menuitem"]', {
      hasText: "Delete"
    });
    await expect(deleteMenuItem).toBeVisible({ timeout: 10_000 });
    await deleteMenuItem.click();

    const loader = this.page.getByTestId("loader");
    await this.page.waitForTimeout(300);
    try {
      await loader.waitFor({ state: "visible", timeout: 2_000 });
      await loader.waitFor({ state: "hidden", timeout: 30_000 });
    } catch {
      // fast mutation
    }
  }
}
