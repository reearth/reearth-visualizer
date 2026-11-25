import { Locator, Page, Route, expect } from "@playwright/test";

type GraphQLMocks = Record<
  string,
  (variables: Record<string, unknown>) => unknown
>;

// The asset modal opened from the New Layer menu (see ProjectScreenPage for
// the menu itself): "Add from Assets" for Visualizer assets, or "Add from
// CMS" with its CMS Assets and CMS Models tabs.
export class AssetLayerCreatorPage {
  modal: Locator;
  cmsAssetsTab: Locator;
  cmsModelsTab: Locator;
  formatSelect: Locator;
  projectSelect: Locator;
  checking: Locator;
  error: Locator;
  errorCloseButton: Locator;
  layerNames: Locator;
  layerNameInput: Locator;
  layerNameAddButton: Locator;
  backButton: Locator;
  submitButton: Locator;
  cancelButton: Locator;
  gridLayoutButton: Locator;
  listLayoutButton: Locator;
  details: Locator;
  detailsTable: Locator;
  detailsColumns: Locator;
  detailsRows: Locator;
  detailsShapes: Locator;
  detailsPoints: Locator;
  detailsTags: Locator;
  detailsCloseButton: Locator;
  openInCmsLink: Locator;

  constructor(private page: Page) {
    this.modal = this.page.getByTestId("asset-layer-creator-modal");
    this.cmsAssetsTab = this.page.getByTestId(
      "asset-layer-creator-tab-cmsAssets"
    );
    this.cmsModelsTab = this.page.getByTestId(
      "asset-layer-creator-tab-cmsModels"
    );
    this.formatSelect = this.page.getByTestId("asset-layer-creator-format");
    this.projectSelect = this.page.getByTestId("asset-layer-creator-project");
    this.checking = this.page.getByTestId("asset-layer-creator-checking");
    this.error = this.page.getByTestId("asset-layer-creator-error");
    this.errorCloseButton = this.error.getByRole("button", { name: "Close" });
    this.layerNames = this.page.getByTestId("asset-layer-creator-layer-names");
    this.layerNameInput = this.layerNames.getByPlaceholder("layer name");
    this.layerNameAddButton = this.page.getByTestId(
      "vectortiles-layer-add-button"
    );
    this.backButton = this.page.getByTestId("asset-layer-creator-back");
    this.submitButton = this.page.getByTestId("asset-layer-creator-submit");
    this.cancelButton = this.page.getByTestId("asset-layer-creator-cancel");
    // IconButton sets its own test ID from its icon.
    this.gridLayoutButton = this.modal.getByTestId("icon-button-grid");
    this.listLayoutButton = this.modal.getByTestId("icon-button-list");
    this.details = this.page.getByTestId("asset-layer-creator-details");
    this.detailsTable = this.details.getByRole("table");
    this.detailsColumns = this.detailsTable.getByRole("columnheader");
    this.detailsRows = this.detailsTable.locator("tbody tr");
    this.detailsShapes = this.page.getByTestId(
      "asset-layer-creator-details-shapes"
    );
    this.detailsPoints = this.detailsShapes.locator("circle");
    this.detailsTags = this.page.getByTestId("asset-layer-creator-details-tag");
    this.detailsCloseButton = this.details.getByRole("button", {
      name: "Close"
    });
    this.openInCmsLink = this.page.getByTestId(
      "asset-layer-creator-open-in-cms"
    );
  }

  card = (id: string): Locator =>
    this.page.getByTestId(`asset-layer-creator-card-${id}`);

  row = (id: string): Locator =>
    this.page.getByTestId(`asset-layer-creator-row-${id}`);

  // A CMS card's or row's info button.
  infoButton = (id: string): Locator =>
    this.page.getByTestId(`asset-layer-creator-info-${id}`).getByRole("button");

  // Opens a CMS card's or row's details from its info button, without
  // selecting it.
  async openDetails(id: string) {
    await this.infoButton(id).click();
    await expect(this.details).toBeVisible();
  }

  async closeDetails() {
    await this.detailsCloseButton.click();
    await expect(this.details).not.toBeVisible();
  }

  private async selectOption(select: Locator, name: string) {
    await select.click();
    await this.page.getByRole("option", { name, exact: true }).click();
  }

  async selectFormat(format: string) {
    await this.selectOption(this.formatSelect, format);
  }

  async selectProject(project: string) {
    await this.selectOption(this.projectSelect, project);
  }

  // Answers the named GraphQL operations with `data` from the mocks, so the
  // CMS tabs don't depend on a CMS connected to the test workspace. Other
  // operations reach the server. Returns how often each mocked operation ran.
  // Call before the app loads: the app's service worker is kept from
  // registering, as requests it makes can't be routed.
  async mockGraphQL(mocks: GraphQLMocks) {
    await this.page.route("**/sw.js", (route) =>
      route.fulfill({ status: 404 })
    );
    const calls: Record<string, number> = {};
    await this.page.route("**/graphql", async (route: Route) => {
      const request = route.request();
      if (request.method() !== "POST") return route.fallback();
      const body = request.postDataJSON() as {
        operationName?: string;
        variables?: Record<string, unknown>;
      } | null;
      const mock = body?.operationName && mocks[body.operationName];
      if (!mock || !body?.operationName) return route.fallback();
      calls[body.operationName] = (calls[body.operationName] ?? 0) + 1;
      // The API may be on another origin than the app.
      const origin = request.headers()["origin"];
      await route.fulfill({
        contentType: "application/json",
        headers: origin
          ? {
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Credentials": "true"
            }
          : {},
        body: JSON.stringify({ data: mock(body.variables ?? {}) })
      });
    });
    return calls;
  }

  // Serves `body` for `url` from the browser's fetch (the model check is a
  // cross-origin request, hence the CORS header).
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

  // "Add from CMS" is part of the EE feature collection, so the app's config
  // selects it whatever the environment sets, along with any other
  // `settings` (such as the cmsUrl that "Open in CMS" links to).
  async enableCms(settings: Record<string, unknown> = {}) {
    await this.page.route("**/reearth_config.json", async (route) => {
      const response = await route.fetch();
      const config = await response.json();
      await route.fulfill({
        response,
        json: { ...config, featureCollection: "ee", ...settings }
      });
    });
  }

  async enterLayerName(name: string) {
    await this.layerNameInput.fill(name);
    await expect(this.submitButton).toBeEnabled();
  }

  // The input of the next layer the editor adds (AddNLSLayerSimple).
  async waitForAddedLayer(): Promise<Record<string, unknown>> {
    const request = await this.page.waitForRequest((req) => {
      if (!req.url().includes("/graphql") || req.method() !== "POST")
        return false;
      try {
        return req.postDataJSON()?.operationName === "AddNLSLayerSimple";
      } catch {
        return false;
      }
    });
    return request.postDataJSON().variables.input;
  }

  async selectCard(id: string) {
    await this.card(id).click();
    await expect(this.submitButton).toBeEnabled();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.modal).not.toBeVisible({ timeout: 10_000 });
  }
}
