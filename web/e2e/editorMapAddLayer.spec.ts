import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { expect, test } from "@reearth/e2e/utils";
import { v4 as uuidv4 } from "uuid";

import pom from "./pom";

const testTitle = "playwright_test_" + uuidv4();

//use session, also could set in playwright config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const authFile = path.join(__dirname, "./utils/.auth/user.json");
test.use({ storageState: authFile });

//test
test("create project and add layer", async ({ page }, testInfo) => {
  const url = process.env.REEARTH_WEB_E2E_BASEURL || "http://localhost:3000/";
  await page.goto(url);
  await page.waitForSelector("button:text('New Project')");

  //  create new project and get in
  const dashboardPage = new pom.visualizer.dashboard.ProjectsPage(page);
  await dashboardPage.createProject(testTitle);
  await page.waitForSelector(`div:text('${testTitle}')`);
  await dashboardPage.dbClickInProjectByName(testTitle);

  // clocs sky box, add new layer
  const mapPage = new pom.visualizer.editor.MapPage(page);
  const newLayerTitle = "newLayerTitle_" + +uuidv4();
  await mapPage.closeSkyBox();
  await mapPage.createNewLayerBySketch(newLayerTitle);

  //add circle
  await page.getByText(newLayerTitle).click();
  await mapPage.circleButton.click();
  const { x, y } = await mapPage.getLocatorOfCanvs();
  await mapPage.createCircleToEarthByLocator(x, y);

  //wait result for stateble
  await page.waitForTimeout(5 * 1000);

  // need first time prepare expact img
  await page.locator("canvas").screenshot({
    path: `${testInfo.snapshotPath("editorMapAddLayerExpect.png")}`
  });

  // test
  expect
    .soft(
      await page.locator("canvas").screenshot({
        path: `${testInfo.snapshotPath("../testSnapshot/editorMapAddLayer/test.png")}`
      })
    )
    .toMatchSnapshot({
      name: "editorMapAddLayerExpect.png",
      maxDiffPixels: 10
    });

  //delete created project
  await dashboardPage.goto();
  await dashboardPage.intoProjectSettingByName(testTitle);
  const generalSettingPage = new pom.visualizer.projectSetting.generalPage(
    page
  );
  await generalSettingPage.deleteProject();
});
