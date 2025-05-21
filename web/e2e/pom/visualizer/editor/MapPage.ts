import type { Page, Locator } from "playwright"; // or the correct path where Page and Locator are exported

export default class MapPage {
  readonly page: Page;
  readonly newLayerButton: Locator;
  readonly addSketchLayerButton: Locator;
  readonly layerNameInput: Locator;
  readonly createButton: Locator;
  readonly circleButton: Locator;
  readonly skyBoxSelectButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newLayerButton = this.page.getByText("New Layer");
    this.addSketchLayerButton = this.page.getByText("Add Sketch Layer");
    this.layerNameInput = this.page.getByPlaceholder("Text");
    this.createButton = this.page.getByRole("button").getByText("Create");
    this.circleButton = this.page
      .locator("div[direction='column'] > div[direction='row'] button")
      .nth(2);
    this.skyBoxSelectButton = this.page.locator(
      "div:has(> div > p:text('Sky Box')) div:has(> p:text('Description needed.')) > div"
    );
  }

  async goto() {
    await this.page.goto(`/`);
  }

  async createNewLayerBySketch(name: string) {
    await this.page.waitForSelector("button:text('New Layer')");
    await this.newLayerButton.click();
    await this.addSketchLayerButton.click();
    await this.layerNameInput.fill(name);
    await this.createButton.click();
  }

  async getLocatorOfCanvs() {
    const box = await this.page.locator("canvas").boundingBox();
    if (!box) throw new Error("no canvas found");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    return { x, y };
  }

  async createCircleToEarthByLocator(x: number, y: number) {
    await this.page.mouse.move(x, y);
    await this.page.mouse.click(x, y, { button: "left" });
    await this.page.waitForTimeout(5 * 1000);
    await this.page.mouse.move(x + 20, y + 20);
    await this.page.mouse.click(x + 20, y + 20, { button: "left", delay: 500 });
  }

  async closeSkyBox() {
    await this.page.getByText("Sky").click();
    await this.skyBoxSelectButton.click();
  }
}
