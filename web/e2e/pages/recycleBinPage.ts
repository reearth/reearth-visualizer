import { Locator, Page } from "@playwright/test";

export class RecycleBinPage {
  projectTitles: Locator = this.page.locator(".css-1r5b2ac");
  recoverButton: Locator = this.page.getByText("Recover");
  deleteButton: Locator = this.page.getByText("Delete");
  deletePoptitle: Locator = this.page.locator(".css-c6c3ja", {
    hasText: "Delete project"
  });
  projectNameDisplay: Locator = this.page.locator(".css-1a6zfpp");
  warningMessages: Locator = this.page.locator(".css-723rv8");
  projectNameInput: Locator = this.page.locator(".css-12ntc5x");
  cancelButton: Locator = this.page.getByRole("button", { name: "Cancel" });
  confirmDeleteButton: Locator = this.page.locator(".css-1l3b7ko");

  constructor(private page: Page) {}

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
    const projectRow = this.page.locator(`.css-96bt7k`, {
      hasText: projectName
    });
    const projectMenuButton = projectRow
      .locator('button[appearance="simple"]')
      .first();
    await projectMenuButton.click();
    await this.recoverButton.waitFor({ state: "visible" });
    await this.recoverButton.click();
  }

  async deleteProject(projectName: string) {
    const projectRow = this.page.locator(`.css-96bt7k`, {
      hasText: projectName
    });
    const projectMenuButton = projectRow
      .locator('button[appearance="simple"]')
      .first();
    await projectMenuButton.click();
    await this.deleteButton.waitFor({ state: "visible" });
    await this.deleteButton.click();
  }
  async confirmDeleteProject(projectName: string) {
    await this.deletePoptitle.waitFor({ state: "visible" });
    await this.projectNameInput.fill(projectName);
    expect(this.projectNameInput).toContain(projectName);
    await this.page.waitForTimeout(2000);
  }
}
