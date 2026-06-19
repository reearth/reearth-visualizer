import { Locator, Page } from "@playwright/test";

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
