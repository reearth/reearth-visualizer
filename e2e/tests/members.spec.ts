import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { DashBoardPage } from "../pages/dashBoardPage";
import { MembersPage } from "../pages/membersPage";
import { createIAPContext } from "../utils/iap-auth";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing REEARTH_WEB_E2E_BASEURL");
}

test.describe.configure({ mode: "serial" });

test.describe("MEMBERS PAGE - Test cases", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let membersPage: MembersPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    membersPage = new MembersPage(page);
    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });

    await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
      timeout: 15000,
      state: "visible"
    });
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
    await context.close();
  });

  test("Navigate to members page via sidebar", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    const membersVisible = await membersLink
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!membersVisible) {
      test.skip(
        true,
        "Members tab not visible - may be disabled by feature flag or personal workspace"
      );
      return;
    }

    await membersLink.click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("members");
  });

  test("Display members page with table headers", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await expect(membersPage.userNameHeader).toBeVisible();
    await expect(membersPage.emailHeader).toBeVisible();
    await expect(membersPage.roleHeader).toBeVisible();
  });

  test("Display search input for filtering members", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await expect(membersPage.searchInput).toBeVisible();
  });

  test("Display invite user button", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await expect(membersPage.inviteButton).toBeVisible();
  });

  test("Display at least one member", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    const ownerRole = page.getByText("Owner").first();
    const hasOwner = await ownerRole.isVisible().catch(() => false);
    expect(hasOwner).toBeTruthy();
  });

  test("Filter members by name or email", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });
    await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
      timeout: 15000,
      state: "visible"
    });

    const profileName = await dashBoardPage.profileUsername
      .textContent()
      .catch(() => null);

    await page.getByTestId("sidebar-tab-members-link").click();
    await page.waitForTimeout(2000);

    if (profileName) {
      const searchTerm = profileName.trim().substring(0, 3);
      await membersPage.searchMembers(searchTerm);
      await page.waitForTimeout(1000);

      await expect(membersPage.noMemberMessage).not.toBeVisible();
    }
  });

  test("Show no results for non-existing member", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    const randomSearch = "zzz_nonexistent_user_xyz_12345";
    await membersPage.searchMembers(randomSearch);
    await page.waitForTimeout(1000);

    await expect(membersPage.noMemberMessage).toBeVisible();
  });

  test("Restore member list when search is cleared", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await membersPage.clearSearch();
    await page.waitForTimeout(1000);

    await expect(membersPage.noMemberMessage).not.toBeVisible();
  });

  test("Open add member modal", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await membersPage.openInviteModal();
    await expect(membersPage.addMemberModalTitle).toBeVisible();
    await expect(membersPage.addMemberSearchInput).toBeVisible();
    await expect(membersPage.addMemberAddButton).toBeVisible();
    await expect(membersPage.addMemberCancelButton).toBeVisible();
  });

  test("Show warning for non-existing user in add modal", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await membersPage.addMemberSearchInput.fill(
      "nonexistent_user_that_does_not_exist@nowhere.example"
    );
    await page.waitForTimeout(2000);

    await expect(membersPage.userNotFoundWarning).toBeVisible();
  });

  test("Close add member modal on cancel", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    await membersPage.addMemberCancelButton.click();
    await page.waitForTimeout(500);
    await expect(membersPage.addMemberModalTitle).not.toBeVisible();
  });

  test("Display member context menu with actions", async () => {
    const membersLink = page.getByTestId("sidebar-tab-members-link");
    if (!(await membersLink.isVisible().catch(() => false))) {
      test.skip(true, "Members tab not available");
      return;
    }

    const actionButton = page
      .locator('button[appearance="simple"]')
      .filter({ has: page.locator('[icon="dotsThreeVertical"]') })
      .first();

    const fallbackButton = page.getByTestId("icon-dotsThreeVertical").first();

    if (await actionButton.isVisible().catch(() => false)) {
      await actionButton.click();
    } else if (await fallbackButton.isVisible().catch(() => false)) {
      await fallbackButton.click();
    } else {
      const dotsButton = page
        .locator("button")
        .filter({ hasText: "" })
        .last();
      await dotsButton.click();
    }

    await page.waitForTimeout(500);

    await expect(membersPage.changeRoleMenuItem).toBeVisible();
    await expect(membersPage.removeMenuItem).toBeVisible();

    await page.keyboard.press("Escape");
  });
});
