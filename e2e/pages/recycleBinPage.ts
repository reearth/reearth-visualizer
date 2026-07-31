import { Locator, Page } from "@playwright/test";

import { MAX_SCROLL_ATTEMPTS } from "../utils/constants";

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
   * Uses evaluate + scrollTop + explicit dispatchEvent rather than mouse.wheel
   * because headless WebKit on Linux does not reliably fire scroll events from
   * synthetic WheelEvents on inner overflow containers.
   */
  async scrollToFindProject(projectName: string): Promise<void> {
    let previousItemCount = -1;
    let stagnantAttempts = 0;

    for (let attempt = 0; attempt < MAX_SCROLL_ATTEMPTS; attempt++) {
      if ((await this.recycleBinMenuButton(projectName).count()) > 0) return;

      const allMenuButtons = this.page.locator(
        '[data-testid^="recycle-bin-item-menu-btn-"]'
      );
      const currentItemCount = await allMenuButtons.count();

      // Item count stopped growing — likely no more pages to load, but allow a
      // couple of retries in case the next page takes >5s to render in CI.
      if (currentItemCount > 0 && currentItemCount === previousItemCount) {
        stagnantAttempts++;
        if (stagnantAttempts >= 2) return;
      } else {
        stagnantAttempts = 0;
      }
      previousItemCount = currentItemCount;

      if (currentItemCount === 0) {
        // First page still loading — wait for any items to appear.
        await this.page
          .waitForFunction(
            () =>
              document.querySelectorAll(
                '[data-testid^="recycle-bin-item-menu-btn-"]'
              ).length > 0,
            { timeout: 5000 }
          )
          .catch(() => {});
        continue;
      }

      // Scroll the overflow container and explicitly fire the scroll event so
      // useLoadMore's listener is triggered in both headed and headless modes.
      await this.page.evaluate(() => {
        const wrapper: HTMLElement | null =
          (document.querySelector(
            '[data-testid="recycle-bin-wrapper"]'
          ) as HTMLElement | null) ??
          (() => {
            const item = document.querySelector(
              '[data-testid^="recycle-bin-item-menu-btn-"]'
            );
            if (!item) return null;
            let el: HTMLElement | null =
              item.parentElement as HTMLElement | null;
            while (el && el !== document.body) {
              const { overflow, overflowY } = window.getComputedStyle(el);
              if (
                overflow === "auto" ||
                overflow === "scroll" ||
                overflowY === "auto" ||
                overflowY === "scroll"
              )
                return el;
              el = el.parentElement as HTMLElement | null;
            }
            return null;
          })();

        if (!wrapper) return;
        wrapper.scrollTop = wrapper.scrollHeight;
        wrapper.dispatchEvent(new Event("scroll", { bubbles: false }));
      });

      // Wait for new items to actually appear in DOM rather than a fixed
      // timeout — this is self-calibrating to CI network latency.
      // If nothing loads within 5s, the next iteration exits via the
      // currentItemCount === previousItemCount guard.
      const countSnapshot = currentItemCount;
      await this.page
        .waitForFunction(
          (prev) =>
            document.querySelectorAll(
              '[data-testid^="recycle-bin-item-menu-btn-"]'
            ).length > prev,
          countSnapshot,
          { timeout: 5000 }
        )
        .catch(() => {});
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
    await menuButton.waitFor({ state: "attached", timeout: 10000 });
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click();
    await this.recoverButton.waitFor({ state: "visible" });
    await this.recoverButton.click();
  }

  async deleteProject(projectName: string) {
    await this.scrollToFindProject(projectName);
    const menuButton = this.recycleBinMenuButton(projectName);
    await menuButton.waitFor({ state: "attached", timeout: 10000 });
    await menuButton.scrollIntoViewIfNeeded();
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
