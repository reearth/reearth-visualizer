import { Locator, Page } from "@playwright/test";

import { MAX_SCROLL_ATTEMPTS, SCROLL_WAIT_MS } from "../utils";

export class RecycleBinPage {
  projectTitles: Locator;
  recoverButton: Locator;
  deleteButton: Locator;
  deletePoptitle: Locator;
  projectNameDisplay: Locator;
  warningMessages: Locator;
  projectNameInput: Locator;
  cancelButton: Locator;
  confirmDeleteButton: Locator;

  constructor(private page: Page) {
    this.projectTitles = this.page.locator(
      '[data-testid^="recycle-bin-item-title-"]'
    );
    this.recoverButton = this.page.getByText("Recover");
    this.deleteButton = this.page.getByText("Delete");
    this.deletePoptitle = this.page.getByText("Delete project");
    this.projectNameDisplay = this.page.locator(
      '[data-testid^="recycle-bin-item-title-"]'
    );
    this.warningMessages = this.page.getByText(
      "This action cannot be undone"
    );
    this.projectNameInput = this.page
      .getByRole("dialog")
      .locator("input")
      .last();
    this.cancelButton = this.page.getByRole("button", { name: "Cancel" });
    this.confirmDeleteButton = this.page.getByRole("button", {
      name: "I am sure I want to delete this project"
    });
  }

  recycleBinItem(projectName: string): Locator {
    return this.page.getByTestId(`recycle-bin-item-${projectName}`);
  }

  recycleBinMenuButton(projectName: string): Locator {
    return this.page.getByTestId(`recycle-bin-item-menu-btn-${projectName}`);
  }

  /**
   * Scrolls the recycle bin list until the target project's menu button is in
   * the DOM, or no further content loads. Required because the recycle bin uses
   * infinite-scroll (load-more) and only shows 16 items per page.
   *
   * Scroll strategy (in priority order):
   *   1. `data-testid="recycle-bin-wrapper"` — available once the frontend
   *      change is deployed.
   *   2. DOM traversal upward from the first visible item — works on any
   *      deploy, looks for the nearest ancestor with overflow auto/scroll.
   */
  async scrollToFindProject(projectName: string): Promise<void> {
    let previousItemCount = -1;

    for (let attempt = 0; attempt < MAX_SCROLL_ATTEMPTS; attempt++) {
      if ((await this.recycleBinMenuButton(projectName).count()) > 0) return;

      const currentItemCount = await this.page
        .locator('[data-testid^="recycle-bin-item-menu-btn-"]')
        .count();

      // Item count stopped growing — no more pages to load.
      if (currentItemCount > 0 && currentItemCount === previousItemCount) return;

      previousItemCount = currentItemCount;

      // Try the testid shortcut first; fall back to DOM traversal.
      const scrolledViaTestId = await this.page
        .getByTestId("recycle-bin-wrapper")
        .evaluate((el) => {
          el.scrollTop = el.scrollHeight;
          return true;
        })
        .catch(() => false);

      if (!scrolledViaTestId) {
        await this.page.evaluate(() => {
          const item = document.querySelector(
            '[data-testid^="recycle-bin-item-menu-btn-"]'
          );
          if (!item) return;
          let el: Element | null = item.parentElement;
          while (el && el !== document.body) {
            const { overflow, overflowY } = getComputedStyle(el);
            if (
              overflow === "auto" ||
              overflowY === "auto" ||
              overflow === "scroll" ||
              overflowY === "scroll"
            ) {
              el.scrollTop = el.scrollHeight;
              return;
            }
            el = el.parentElement;
          }
        });
      }

      await this.page.waitForTimeout(SCROLL_WAIT_MS);
    }
  }

  async confirmDeletion(projectName: string) {
    await this.projectNameInput.fill(projectName);
  }

  async cancelDeletion() {
    await this.cancelButton.click();
  }

  async isDeleteButtonEnabled(): Promise<boolean> {
    return await this.confirmDeleteButton.isEnabled();
  }

  async getExpectedProjectName() {
    return await this.projectNameDisplay.textContent();
  }

  async recoverProject(projectName: string) {
    await this.scrollToFindProject(projectName);
    const menuButton = this.recycleBinMenuButton(projectName);
    await menuButton.waitFor({ state: "visible", timeout: 10000 });
    await menuButton.click();
    await this.recoverButton.waitFor({ state: "visible" });
    await this.recoverButton.click();
  }

  async deleteProject(projectName: string) {
    await this.scrollToFindProject(projectName);
    const menuButton = this.recycleBinMenuButton(projectName);
    await menuButton.waitFor({ state: "visible", timeout: 10000 });
    await menuButton.click();
    await this.deleteButton.waitFor({ state: "visible" });
    await this.deleteButton.click();
  }

  async confirmDeleteProject(projectName: string) {
    await this.deletePoptitle.waitFor({ state: "visible" });
    await this.projectNameInput.fill(projectName);
    await this.page.waitForTimeout(500);
  }
}
