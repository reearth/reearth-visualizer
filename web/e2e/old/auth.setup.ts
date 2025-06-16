// globalSetup.js
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { chromium, expect } from "@reearth/e2e/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const authFile = path.join(__dirname, "./utils/.auth/user.json");

export default async () => {
  if (
    !process.env.REEARTH_WEB_E2E_ACCOUNT ||
    !process.env.REEARTH_WEB_E2E_ACCOUNT_PASSWORD
  ) {
    throw new Error(
      "please setup .env for REEARTH_WEB_E2E_ACCOUNT and REEARTH_WEB_E2E_ACCOUNT_PASSWORD"
    );
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    process.env.REEARTH_WEB_E2E_BASEURL || "http://localhost:3000/"
  );
  await page
    .getByPlaceholder("username/email")
    .fill(process.env.REEARTH_WEB_E2E_ACCOUNT);
  await page
    .getByPlaceholder("your password")
    .fill(process.env.REEARTH_WEB_E2E_ACCOUNT_PASSWORD);
  await page.getByText("LOG IN").click();
  await page.waitForTimeout(10 * 1000);
  await page.goto(
    process.env.REEARTH_WEB_E2E_BASEURL || "http://localhost:3000/"
  );
  await expect(page.getByRole("button", { name: "New Project" })).toBeVisible();
  await page.context().storageState({ path: authFile });
  await browser.close();
};
