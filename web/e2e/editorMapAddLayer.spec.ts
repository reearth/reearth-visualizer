import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { expect, test } from "@reearth/e2e/utils";
import { v4 as uuidv4 } from "uuid";

import pom from "./pom";

//use session, also could set in playwright config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const authFile = path.join(__dirname, "./utils/.auth/user.json");
test.use({ storageState: authFile });

//test
test("create project and add layer", async ({ page }) => {
  const url = process.env.REEARTH_WEB_E2E_BASEURL || "http://localhost:3000/";

  await page.goto(url);
  await page.waitForSelector("button:text('New Project')");

  //  create new project and get in
  const dashboardPage = new pom.visualizer.dashboard.ProjectsPage(page);
  const projectName = "playwright_test_" + uuidv4();
  await dashboardPage.createProject(projectName);
  await page.waitForSelector(`div:text('${projectName}')`);
  await dashboardPage.dbClickInProjectByName(projectName);

  // clocs sky box, add new layer
  const mapPage = new pom.visualizer.editor.MapPage(page);
  const layerTitle = "layer_" + uuidv4();
  await mapPage.closeSkyBox();
  await page.waitForTimeout(8 * 1000);

  // take screenshot
  const canvas = page.locator("canvas");
  expect.soft(await canvas.screenshot()).toMatchSnapshot("before-action.png", {
    maxDiffPixels: 100
  });

  await mapPage.createNewLayerBySketch(layerTitle);

  //add circle
  await page.getByText(layerTitle).click();
  await mapPage.circleButton.click();
  const { x, y } = await mapPage.getLocatorOfCanvs();
  await mapPage.createCircleToEarthByLocator(x, y);

  //wait result for stateble
  await page.waitForTimeout(10 * 1000);

  expect
    .soft(await canvas.screenshot())
    .not.toMatchSnapshot("before-action.png");
  expect.soft(await canvas.screenshot()).toMatchSnapshot("after-action.png");

  //delete created project
  await dashboardPage.goto();
  await dashboardPage.intoProjectSettingByName(projectName);
  const generalSettingPage = new pom.visualizer.projectSetting.generalPage(
    page
  );
  await generalSettingPage.deleteProject();
});
