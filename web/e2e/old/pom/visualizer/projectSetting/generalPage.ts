import type { Page, Locator } from "@reearth/e2e/utils";

export default class generalPage {
  readonly page: Page;
  readonly projectNameElement: Locator;

  constructor(page: Page) {
    this.page = page;

    this.projectNameElement = this.page
      .locator(
        "div:has( > p:text('Please type your project name to continue.')) > p"
      )
      .first();
  }

  async deleteProject() {
    await this.page.getByText("Delete project").click();
    const projectname = await this.projectNameElement.textContent();
    const projectNameInput = this.page.locator(
      "div:has( > p:text('Please type your project name to continue.')) > div > input"
    );
    await projectNameInput.fill(projectname as string);
    await this.page
      .getByText("I am sure I want to delete this project.")
      .click();
  }
}
