import { Locator, Page } from "@playwright/test";

export class RecycleBinPage {
  projectTitles: Locator = this.page.locator(
    '[data-testid^="recycle-bin-item-title-"]'
  );
  recoverButton: Locator = this.page.getByText("Recover");
  deleteButton: Locator = this.page.getByText("Delete");
  deletePoptitle: Locator = this.page.getByText("Delete project");
  projectNameDisplay: Locator = this.page.locator(
    '[data-testid^="recycle-bin-item-title-"]'
  );
  warningMessages: Locator = this.page.getByText(
    "This action cannot be undone"
  );
  projectNameInput: Locator = this.page
    .getByRole("dialog")
    .locator("input")
    .last();
  cancelButton: Locator = this.page.getByRole("button", { name: "Cancel" });
  confirmDeleteButton: Locator = this.page.getByRole("button", {
    name: "I am sure I want to delete this project"
  });

  constructor(private page: Page) {}

  recycleBinItem(projectName: string): Locator {
    return this.page.getByTestId(`recycle-bin-item-${projectName}`);
  }

  recycleBinMenuButton(projectName: string): Locator {
    return this.page.getByTestId(`recycle-bin-item-menu-btn-${projectName}`);
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
    const menuButton = this.recycleBinMenuButton(projectName);
    await menuButton.waitFor({ state: "visible", timeout: 10000 });
    await menuButton.click();
    await this.recoverButton.waitFor({ state: "visible" });
    await this.recoverButton.click();
  }

  async deleteProject(projectName: string) {
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
