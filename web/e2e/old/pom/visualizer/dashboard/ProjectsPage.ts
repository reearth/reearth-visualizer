import type { Page, Locator } from "@reearth/e2e/utils";

export default class ProjectsPage {
  readonly page: Page;
  readonly newProjectButton: Locator;
  readonly projectNameInput: Locator;
  readonly applyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newProjectButton = this.page.getByText("New Project");
    this.projectNameInput = this.page.getByPlaceholder("Text");
    this.applyButton = this.page.getByText("Apply");
  }

  async goto() {
    await this.page.goto(`/`);
  }

  async createProject(name: string) {
    await this.newProjectButton.click();
    await this.projectNameInput.fill(name);
    await this.applyButton.click();
  }

  async dbClickInProjectByName(name: string) {
    await this.page
      .locator(`div:has(> div > div > div:text('${name}') ) > :first-child`)
      .dblclick();
  }

  async intoProjectSettingByName(name: string) {
    await this.page
      .locator(`div:has(> div > div:text('${name}')) button`)
      .click();
    await this.page.getByText("Project Setting").click();
    await this.page.waitForSelector("p:text('Project Name')");
  }
}
