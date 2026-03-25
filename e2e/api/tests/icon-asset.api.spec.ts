import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_ICON_ASSET,
  CREATE_PROJECT,
  DELETE_PROJECT,
  REMOVE_ASSET
} from "../graphql/mutations";
import { GET_ASSETS, GET_ME } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

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

test.describe("Icon asset CRUD lifecycle", () => {
  let workspaceId: string;
  let projectId: string;
  let iconAssetId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (iconAssetId) {
      try {
        await gqlClient.mutate(REMOVE_ASSET, {
          input: { assetId: iconAssetId }
        });
      } catch {
        // already removed
      }
    }
    if (projectId) {
      try {
        await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
      } catch {
        // already deleted
      }
    }
  });

  test("Setup: get workspace and create project", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;

    const { data } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: `Icon Asset Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = data.createProject.project.id;
  });

  test("Upload an icon asset to the workspace", async ({ gqlClient }) => {
    const png = createTestPng();

    const { status, data } = await gqlClient.uploadFile<{
      createIconAsset: {
        asset: {
          id: string;
          name: string;
          workspaceId: string;
          projectId: string | null;
          contentType: string;
        };
      };
    }>(
      CREATE_ICON_ASSET,
      {
        input: { workspaceId, projectId: null, file: null }
      },
      png,
      "icon-test.png",
      "image/png",
      "variables.input.file"
    );

    expect(status).toBe(200);
    expect(data.createIconAsset.asset.name).toBe("icon-test.png");
    expect(data.createIconAsset.asset.workspaceId).toBeTruthy();
    iconAssetId = data.createIconAsset.asset.id;
  });

  test("Upload an icon asset linked to a project", async ({ gqlClient }) => {
    const png = createTestPng();

    const { status, data } = await gqlClient.uploadFile<{
      createIconAsset: {
        asset: {
          id: string;
          name: string;
          projectId: string;
        };
      };
    }>(
      CREATE_ICON_ASSET,
      {
        input: { workspaceId, projectId, file: null }
      },
      png,
      "icon-project.png",
      "image/png",
      "variables.input.file"
    );

    expect(status).toBe(200);
    expect(data.createIconAsset.asset.name).toBe("icon-project.png");
    expect(data.createIconAsset.asset.projectId).toBe(projectId);

    // Clean up this second asset
    await gqlClient.mutate(REMOVE_ASSET, {
      input: { assetId: data.createIconAsset.asset.id }
    });
  });

  test("Icon asset appears in workspace asset listing", async ({
    gqlClient
  }) => {
    const { data } = await gqlClient.query<{
      assets: { nodes: { id: string; name: string }[] };
    }>(GET_ASSETS, {
      workspaceId,
      pagination: { first: 50 },
      sort: { field: "DATE", direction: "DESC" }
    });

    const ids = data.assets.nodes.map((n) => n.id);
    expect(ids).toContain(iconAssetId);
  });

  test("Remove the icon asset", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeAsset: { assetId: string };
    }>(REMOVE_ASSET, { input: { assetId: iconAssetId } });

    expect(status).toBe(200);
    expect(data.removeAsset.assetId).toBe(iconAssetId);
    iconAssetId = ""; // prevent afterAll from double-removing
  });
});

// Negative scenarios
test.describe("Icon asset negative scenarios", () => {
  test("Cannot upload icon asset to a non-existent workspace", async ({
    gqlClient
  }) => {
    const fakeWsId = generateFakeId();
    const png = createTestPng();
    await expect(
      gqlClient.uploadFile(
        CREATE_ICON_ASSET,
        { input: { workspaceId: fakeWsId, projectId: null, file: null } },
        png,
        "orphan-icon.png",
        "image/png",
        "variables.input.file"
      )
    ).rejects.toThrow();
  });
});
