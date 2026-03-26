import { faker } from "@faker-js/faker";

import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";
import { CREATE_ASSET, REMOVE_ASSET } from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

/**
 * Builds a small PNG buffer for upload tests.
 * The file is a valid 1×1 red pixel PNG (67 bytes).
 */
function createTestPng(): Buffer {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );
}

test.describe.configure({ mode: "serial" });

test.describe("GET /assets/:filename — asset file download", () => {
  let workspaceId: string;
  let assetId: string;
  let assetUrl: string;

  test.afterAll(async ({ gqlClient }) => {
    if (assetId) {
      try {
        await gqlClient.mutate(REMOVE_ASSET, { input: { assetId } });
      } catch {
        // already removed
      }
    }
  });

  test("Setup: upload an asset", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;

    const png = createTestPng();
    const { data } = await gqlClient.uploadFile<{
      createAsset: {
        asset: { id: string; url: string; name: string };
      };
    }>(
      CREATE_ASSET,
      {
        workspaceId,
        projectId: null,
        file: null,
        coreSupport: true
      },
      png,
      `download-test-${faker.string.alphanumeric(6)}.png`,
      "image/png"
    );

    assetId = data.createAsset.asset.id;
    assetUrl = data.createAsset.asset.url;
    expect(assetUrl).toBeTruthy();
  });

  test("Download the uploaded asset via its URL", async ({ request }) => {
    // The asset URL may be an absolute URL or a relative path like /assets/filename
    // Extract the path portion if it's a full URL
    let downloadPath: string;
    try {
      const parsed = new URL(assetUrl);
      downloadPath = parsed.pathname;
    } catch {
      downloadPath = assetUrl;
    }

    const res = await request.get(`${API_BASE_URL}${downloadPath}`);

    expect(res.status()).toBe(200);
    const body = await res.body();
    // A valid PNG starts with the magic bytes \x89PNG
    expect(body[0]).toBe(0x89);
    expect(body[1]).toBe(0x50); // P
    expect(body[2]).toBe(0x4e); // N
    expect(body[3]).toBe(0x47); // G
  });

  test("GET /assets/non-existent-file returns 404", async ({ request }) => {
    const res = await request.get(
      `${API_BASE_URL}/assets/no-such-file-${faker.string.alphanumeric(20)}.png`
    );

    expect(res.status()).toBe(404);
  });
});
