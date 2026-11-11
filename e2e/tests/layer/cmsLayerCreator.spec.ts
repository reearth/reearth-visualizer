import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../../global-setup";
import { AssetLayerCreatorPage } from "../../pages/assetLayerCreatorPage";
import { DashBoardPage } from "../../pages/dashBoardPage";
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

// The CMS is mocked: its GraphQL operations are answered in the browser and
// every request to this host (the Public API and asset files) by a mocked
// route, so the tests run in CI without a CMS connected to the workspace.
const MOCK_HOST = "https://e2e-mock.reearth.test";
const CREATED_AT = "2026-01-01T00:00:00Z";

const CMS_PROJECTS = [
  { id: "cms-p1", name: "E2E Roads" },
  { id: "cms-p2", name: "E2E Rivers" }
].map((p) => ({
  __typename: "CMSProject",
  ...p,
  alias: p.id,
  description: "",
  workspaceId: "ws",
  public: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT
}));

const model = (id: string, projectId: string, name: string) => ({
  __typename: "CMSModel",
  id,
  projectId,
  name,
  description: "",
  key: id,
  publicApiEp: `${MOCK_HOST}/api/p/${projectId}/${id}`,
  editorUrl: `${MOCK_HOST}/editor/${id}`,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT
});

const CMS_MODELS = [
  model("model-roads", "cms-p1", "Roads"),
  model("model-rivers", "cms-p2", "Rivers"),
  model("model-notes", "cms-p2", "Notes")
];

const asset = (
  id: string,
  projectId: string,
  filename: string,
  previewType: string,
  archiveExtractionStatus = "skipped"
) => ({
  __typename: "CMSAsset",
  id,
  projectId,
  filename,
  size: 1024,
  previewType,
  url: `${MOCK_HOST}/assets/${filename}`,
  archiveExtractionStatus,
  public: true,
  createdAt: CREATED_AT
});

const CMS_ASSETS = [
  asset("asset-geojson", "cms-p1", "roads.geojson", "geo"),
  asset("asset-mvt", "cms-p1", "tiles.zip", "geo_mvt", "done"),
  asset("asset-wms", "cms-p2", "tokyo_wms.cgi", "unknown"),
  asset("asset-glb", "cms-p2", "building.glb", "model_3d")
];

const connection = <T extends { projectId: string }>(
  typename: string,
  nodes: T[],
  projectId: unknown
) => {
  const own = nodes.filter((n) => n.projectId === projectId);
  return { __typename: typename, totalCount: own.length, nodes: own };
};

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

test.describe.configure({ mode: "serial" });

test.describe("Add Layer from CMS", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let projectScreen: ProjectScreenPage;
  let assetLayerCreator: AssetLayerCreatorPage;
  let graphQLCalls: Record<string, number>;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    projectScreen = new ProjectScreenPage(page);
    assetLayerCreator = new AssetLayerCreatorPage(page);

    await assetLayerCreator.enableDevMode();
    graphQLCalls = await assetLayerCreator.mockGraphQL({
      GetCMSProjects: () => ({
        cmsProjects: {
          __typename: "CMSProjectConnection",
          totalCount: CMS_PROJECTS.length,
          nodes: CMS_PROJECTS
        }
      }),
      GetCMSModels: ({ projectId }) => ({
        cmsModels: connection("CMSModelConnection", CMS_MODELS, projectId)
      }),
      GetCMSAssets: ({ projectId }) => ({
        cmsAssets: connection("CMSAssetConnection", CMS_ASSETS, projectId)
      })
    });

    // Registered first so the mocks below take precedence. "Notes" has no
    // geometry field, so the Public API can't serve it as GeoJSON.
    await assetLayerCreator.mockUrl(`${MOCK_HOST}/**`, { status: 404 });
    await assetLayerCreator.mockUrl(/\/model-roads\.geojson/, {
      body: VALID_GEOJSON
    });
    await assetLayerCreator.mockUrl(/\/model-notes\.geojson/, {
      status: 400,
      body: '{"error":"no geometry field in this model"}'
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

    // A project to add the layers to, so each test can run on its own.
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      "CMS Layer Creator E2E Test"
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
    await projectsPage.goToProjectPage(projectName);
    await expect(projectScreen.newLayerButton).toBeVisible();
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

  async function openTab(tab: "cmsAssets" | "cmsModels") {
    await projectScreen.newLayerButton.click();
    await projectScreen.addFromAssetsButton.click();
    await expect(assetLayerCreator.modal).toBeVisible();
    await (
      tab === "cmsAssets"
        ? assetLayerCreator.cmsAssetsTab
        : assetLayerCreator.cmsModelsTab
    ).click();
    await expect(assetLayerCreator.submitButton).toBeDisabled();
  }

  test("Models: lists every project's models, without a format filter", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-008" });
    await openTab("cmsModels");
    await expect(assetLayerCreator.projectSelect).toContainText(
      "All CMS projects"
    );
    for (const m of CMS_MODELS) {
      await expect(assetLayerCreator.card(m.id)).toBeVisible();
    }
    await expect(assetLayerCreator.card("model-roads")).toContainText(
      "E2E Roads"
    );
    // CMS models only come as GeoJSON.
    await expect(assetLayerCreator.formatSelect).toHaveCount(0);
    await assetLayerCreator.cancel();
  });

  test("Models: filters by project, keeping all projects' models loaded", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-008" });
    await openTab("cmsModels");
    await expect(assetLayerCreator.card("model-rivers")).toBeVisible();

    await assetLayerCreator.selectProject("E2E Roads");
    await expect(assetLayerCreator.card("model-roads")).toBeVisible();
    await expect(assetLayerCreator.card("model-rivers")).not.toBeVisible();

    // Back to all projects, the models already loaded show again without
    // being fetched again.
    const fetched = graphQLCalls.GetCMSModels;
    await assetLayerCreator.selectProject("All CMS projects");
    for (const m of CMS_MODELS) {
      await expect(assetLayerCreator.card(m.id)).toBeVisible();
    }
    expect(graphQLCalls.GetCMSModels).toBe(fetched);
    await assetLayerCreator.cancel();
  });

  test("Models: reports a model without a geometry field", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-008" });
    await openTab("cmsModels");
    await assetLayerCreator.selectCard("model-notes");
    await assetLayerCreator.submitButton.click();

    await expect(assetLayerCreator.checking).toContainText(
      "Checking the model"
    );
    await expect(assetLayerCreator.submitButton).toBeDisabled();

    await expect(assetLayerCreator.error).toContainText(
      "Cannot add this Model"
    );
    await expect(assetLayerCreator.error).toContainText(
      "No Geometry field was found in this model"
    );
    await expect(assetLayerCreator.checking).not.toBeVisible();
    await expect(assetLayerCreator.modal).toBeVisible();

    await assetLayerCreator.errorCloseButton.click();
    await expect(assetLayerCreator.error).not.toBeVisible();
    await assetLayerCreator.cancel();
  });

  test("Models: adds a model with geometry as a GeoJSON layer", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-008" });
    await openTab("cmsModels");
    await assetLayerCreator.selectCard("model-roads");
    await assetLayerCreator.submitButton.click();

    await expect(assetLayerCreator.checking).toBeVisible();
    await expect(assetLayerCreator.modal).not.toBeVisible({ timeout: 20_000 });
    await projectScreen.verifyLayerAdded("Roads");
  });

  test("Assets: offers MVT and WMS, leaving out assets no layer can show", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-009" });
    await openTab("cmsAssets");
    await expect(assetLayerCreator.card("asset-geojson")).toContainText(
      "GeoJSON"
    );
    await expect(assetLayerCreator.card("asset-mvt")).toContainText("MVT");
    await expect(assetLayerCreator.card("asset-wms")).toContainText("WMS");
    await expect(assetLayerCreator.card("asset-glb")).toHaveCount(0);

    await assetLayerCreator.selectFormat("WMS");
    await expect(assetLayerCreator.card("asset-wms")).toBeVisible();
    await expect(assetLayerCreator.card("asset-geojson")).not.toBeVisible();
    await expect(assetLayerCreator.card("asset-mvt")).not.toBeVisible();
    await assetLayerCreator.cancel();
  });

  test("Assets: an MVT asset asks for the layers to show", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-009" });
    await openTab("cmsAssets");
    await assetLayerCreator.selectCard("asset-mvt");
    await assetLayerCreator.submitButton.click();

    await expect(assetLayerCreator.layerNames).toBeVisible();
    await expect(assetLayerCreator.submitButton).toBeDisabled();
    await assetLayerCreator.backButton.click();
    await expect(assetLayerCreator.card("asset-mvt")).toBeVisible();
    await assetLayerCreator.cancel();
  });

  test("Assets: adds an MVT asset with the layers named", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-009" });
    await openTab("cmsAssets");
    await assetLayerCreator.selectCard("asset-mvt");
    await assetLayerCreator.submitButton.click();

    // One name added to the list, one still being typed.
    await assetLayerCreator.enterLayerName("roads");
    await assetLayerCreator.layerNameAddButton.click();
    await assetLayerCreator.layerNameInput.fill("rivers");

    const added = assetLayerCreator.waitForAddedLayer();
    await assetLayerCreator.submitButton.click();
    expect(await added).toMatchObject({
      title: "tiles",
      config: {
        data: {
          type: "mvt",
          url: `${MOCK_HOST}/assets/tiles/{z}/{x}/{y}.mvt`,
          layers: ["roads", "rivers"]
        }
      }
    });
    await expect(assetLayerCreator.modal).not.toBeVisible({ timeout: 10_000 });
    await projectScreen.verifyLayerAdded("tiles");
  });

  test("Assets: adds a WMS asset with a single layer name", async () => {
    test.info().annotations.push({ type: "story", description: "US-EXTL-009" });
    await openTab("cmsAssets");
    await assetLayerCreator.selectCard("asset-wms");
    await assetLayerCreator.submitButton.click();
    await assetLayerCreator.enterLayerName("tokyo");

    const added = assetLayerCreator.waitForAddedLayer();
    await assetLayerCreator.submitButton.click();
    expect(await added).toMatchObject({
      title: "tokyo_wms",
      config: {
        data: {
          type: "wms",
          url: `${MOCK_HOST}/assets/tokyo_wms.cgi`,
          layers: "tokyo"
        }
      }
    });
    await expect(assetLayerCreator.modal).not.toBeVisible({ timeout: 10_000 });
    await projectScreen.verifyLayerAdded("tokyo_wms");
  });
});
