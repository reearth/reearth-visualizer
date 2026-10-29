import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../../global-setup";
import { DashBoardPage } from "../../pages/dashBoardPage";
import { DataSourceManagerPage } from "../../pages/dataSourceManagerPage";
import { ProjectScreenPage } from "../../pages/projectScreenPage";
import { ProjectsPage } from "../../pages/projectsPage";
import { createIAPContext } from "../../utils/iap-auth";
import { deleteProjectByName } from "../../utils/project-cleanup";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required variables.");
}

const projectName = "e2e-" + faker.string.alpha(15);
const projectAlias = faker.string.alpha(20);

// Every request to this host is answered by a mocked route (404 unless a test
// mocks the path), so the URL checks never leave the browser and can run in CI.
const MOCK_HOST = "https://e2e-mock.reearth.test";

const VALID_GEOJSON = JSON.stringify({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [139.6917, 35.6895] },
      properties: { name: "Tokyo" }
    }
  ]
});

const VALID_CZML = JSON.stringify([
  { id: "document", name: "e2e", version: "1.0" },
  { id: "tokyo", position: { cartographicDegrees: [139.6917, 35.6895, 0] } }
]);

test.describe.configure({ mode: "serial" });

test.describe("Add Layer from URL / Value — Validation", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let projectScreen: ProjectScreenPage;
  let dataSourceManager: DataSourceManagerPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    projectScreen = new ProjectScreenPage(page);
    dataSourceManager = new DataSourceManagerPage(page);

    // Registered first so the per-test mocks below take precedence.
    await dataSourceManager.mockUrl(`${MOCK_HOST}/**`, { status: 404 });
    await dataSourceManager.mockUrl(`${MOCK_HOST}/valid.geojson`, {
      body: VALID_GEOJSON
    });
    await dataSourceManager.mockUrl(`${MOCK_HOST}/page.geojson`, {
      body: "<!doctype html><html><body>Not found</body></html>"
    });
    await dataSourceManager.mockUrl(`${MOCK_HOST}/points.csv`, {
      body: "name,lat,lng\nTokyo,35.6895,139.6917"
    });
    await dataSourceManager.mockUrl(/e2e-mock\.reearth\.test\/wms\?/, {
      body: '<?xml version="1.0"?><WMS_Capabilities version="1.3.0"></WMS_Capabilities>'
    });

    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });

    try {
      await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
        timeout: 15000,
        state: "visible"
      });
    } catch (error) {
      const currentUrl = page.url();
      if (currentUrl.includes("/login")) {
        throw new Error(
          "Authentication failed - redirected to login page. Check if STORAGE_STATE is valid."
        );
      }
      throw new Error(
        `Dashboard did not load properly. Current URL: ${currentUrl}. Error: ${error}`
      );
    }
  });

  // eslint-disable-next-line no-empty-pattern
  test.afterEach(async ({}, testInfo) => {
    const videoPath = await page.video()?.path();
    if (videoPath) {
      await testInfo.attach("video", {
        path: videoPath,
        contentType: "video/webm"
      });
    }
  });

  test.afterAll(async () => {
    await deleteProjectByName(page.request, projectName);
    await context.close();
  });

  async function openUrlModal() {
    await projectScreen.newLayerButton.click();
    await projectScreen.addFromUrlButton.click();
    await expect(dataSourceManager.urlModal).toBeVisible();
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
  }

  async function openValueModal() {
    await projectScreen.newLayerButton.click();
    await projectScreen.addFromValueButton.click();
    await expect(dataSourceManager.valueModal).toBeVisible();
    await expect(dataSourceManager.valueSubmitButton).toBeDisabled();
  }

  test("Create a project for validation tests", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      "Layer Creator Validation E2E Test"
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
  });

  test("Navigate to editor", async () => {
    await projectsPage.goToProjectPage(projectName);
    await expect(projectScreen.newLayerButton).toBeVisible();
  });

  test("URL: rejects a non-http(s) URL", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl("ftp://example.com/data.geojson");
    await expect(dataSourceManager.urlError).toContainText(
      "Enter a valid URL starting with http:// or https://"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();

    // Editing the URL clears the error until it is checked again.
    await dataSourceManager.urlInput.fill(`${MOCK_HOST}/valid.geojson`);
    await expect(dataSourceManager.urlError).not.toBeVisible();
    await dataSourceManager.cancelUrl();
  });

  test("URL: reports an extension that belongs to another format", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/data.kml`);
    await dataSourceManager.selectUrlFormat("GeoJSON");
    await expect(dataSourceManager.urlError).toContainText(
      "looks like KML data, not GeoJSON"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: reports an extension the format does not accept", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/data.txt`);
    await dataSourceManager.selectUrlFormat("GeoJSON");
    await expect(dataSourceManager.urlError).toContainText(
      "GeoJSON URLs must end with .geojson / .json"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: 3D Tiles requires the tileset entry point", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/tiles/`);
    await dataSourceManager.selectUrlFormat("3D Tiles");
    await expect(dataSourceManager.urlError).toContainText(
      "must point to the tileset entry point"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: vector tiles require a {z}/{x}/{y} template", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/tiles.pbf`);
    await dataSourceManager.selectUrlFormat("Vector Tiles (MVT)");
    await expect(dataSourceManager.urlError).toContainText(
      "must be a template containing {z}, {x} and {y}"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: reports an unreachable URL", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    // Not mocked, so the host answers 404. The format is inferred from .geojson.
    await dataSourceManager.enterUrl(`${MOCK_HOST}/missing.geojson`);
    await expect(dataSourceManager.urlError).toContainText(
      "The URL could not be reached"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: reports a response that is not data of the format", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/page.geojson`);
    await expect(dataSourceManager.urlError).toContainText(
      "returned empty or unreadable data"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: a valid URL enables Add until the URL changes", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/valid.geojson`);
    await expect(dataSourceManager.urlFormatSelect).toContainText("GeoJSON");
    await expect(dataSourceManager.urlSubmitButton).toBeEnabled();
    await expect(dataSourceManager.urlError).not.toBeVisible();

    await dataSourceManager.urlInput.fill(`${MOCK_HOST}/other.geojson`);
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: CSV requires latitude and longitude columns", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/points.csv`);
    await expect(dataSourceManager.urlFormatSelect).toContainText("CSV");
    await expect(dataSourceManager.urlError).not.toBeVisible();
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();

    await dataSourceManager.csvLatColumnInput.fill("lat");
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.csvLngColumnInput.fill("lng");
    await expect(dataSourceManager.urlSubmitButton).toBeEnabled();
    await dataSourceManager.cancelUrl();
  });

  test("URL: WMS without layer names asks for one", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-006" });
    await openUrlModal();
    await dataSourceManager.enterUrl(`${MOCK_HOST}/wms`);
    await dataSourceManager.selectUrlFormat("WMS");
    await expect(dataSourceManager.urlError).toContainText(
      "WMS URLs need at least one layer name"
    );
    await expect(dataSourceManager.urlSubmitButton).toBeDisabled();
    await dataSourceManager.cancelUrl();
  });

  test("Value: rejects data in no supported format", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-007" });
    await openValueModal();
    await dataSourceManager.enterValue("not geospatial data");
    await expect(dataSourceManager.valueError).toContainText(
      "doesn't match any supported format"
    );
    await expect(dataSourceManager.valueSubmitButton).toBeDisabled();

    // Editing the value clears the error until it is checked again.
    await dataSourceManager.valueInput.fill(VALID_GEOJSON);
    await expect(dataSourceManager.valueError).not.toBeVisible();
    await dataSourceManager.cancelValue();
  });

  test("Value: detects the format and enables Add", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-007" });
    await openValueModal();
    await dataSourceManager.enterValue(VALID_CZML);
    await expect(dataSourceManager.valueFormatSelect).toContainText("CZML");
    await expect(dataSourceManager.valueError).not.toBeVisible();
    await expect(dataSourceManager.valueSubmitButton).toBeEnabled();
    await dataSourceManager.cancelValue();
  });

  test("Value: reports malformed data of the selected format", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-007" });
    await openValueModal();
    await dataSourceManager.selectValueFormat("GeoJSON");
    // A FeatureCollection without "features".
    await dataSourceManager.enterValue('{"type":"FeatureCollection"}');
    await expect(dataSourceManager.valueError).toContainText("Invalid GeoJSON");
    await expect(dataSourceManager.valueSubmitButton).toBeDisabled();

    await dataSourceManager.selectValueFormat("KML");
    await dataSourceManager.enterValue("<kml><Placemark></kml>");
    await expect(dataSourceManager.valueError).toContainText("Invalid KML");
    await expect(dataSourceManager.valueSubmitButton).toBeDisabled();
    await dataSourceManager.cancelValue();
  });

  test("Value: reports data of another format, fixed by switching format", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-007" });
    await openValueModal();
    await dataSourceManager.selectValueFormat("KML");
    await dataSourceManager.enterValue(VALID_GEOJSON);
    await expect(dataSourceManager.valueError).toContainText(
      "looks like GeoJSON data, not KML"
    );
    await expect(dataSourceManager.valueSubmitButton).toBeDisabled();

    await dataSourceManager.selectValueFormat("GeoJSON");
    await expect(dataSourceManager.valueError).not.toBeVisible();
    await expect(dataSourceManager.valueSubmitButton).toBeEnabled();
    await dataSourceManager.cancelValue();
  });
});
