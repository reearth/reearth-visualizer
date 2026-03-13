import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_ASSET,
  CREATE_PROJECT,
  DELETE_PROJECT,
  REMOVE_ASSET,
  UPDATE_ASSET
} from "../graphql/mutations";
import { GET_ASSETS, GET_ME } from "../graphql/queries";

// Crockford Base32 charset used by oklog/ulid
const CROCKFORD = "0123456789abcdefghjkmnpqrstvwxyz";
const generateFakeId = () => faker.string.fromCharacters(CROCKFORD, 26);

test.describe.configure({ mode: "serial" });

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

/** Builds a small CSV buffer for upload tests. */
function createTestCsv(): Buffer {
  return Buffer.from("id,name,value\n1,alpha,100\n2,beta,200\n", "utf-8");
}

// ────────────────────────────────────────────────────────────────────────────
// Asset CRUD lifecycle
// ────────────────────────────────────────────────────────────────────────────

test.describe("Asset CRUD lifecycle", () => {
  let workspaceId: string;
  let projectId: string;
  let assetId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (projectId) {
      try {
        await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
      } catch {
        // already cleaned up
      }
    }
  });

  test("Setup: get workspace and create a project", async ({ gqlClient }) => {
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
        name: `Asset Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = data.createProject.project.id;
  });

  test("Upload a PNG asset to the workspace", async ({ gqlClient }) => {
    const png = createTestPng();

    const { status, data } = await gqlClient.uploadFile<{
      createAsset: {
        asset: {
          id: string;
          name: string;
          size: number;
          workspaceId: string;
          projectId: string | null;
          coreSupport: boolean;
          contentType: string;
        };
      };
    }>(
      CREATE_ASSET,
      { workspaceId, projectId: null, file: null, coreSupport: true },
      png,
      "test-image.png",
      "image/png"
    );

    expect(status).toBe(200);
    expect(data.createAsset.asset.name).toBe("test-image.png");
    expect(data.createAsset.asset.coreSupport).toBe(true);
    expect(data.createAsset.asset.workspaceId).toBeTruthy();
    expect(data.createAsset.asset.projectId).toBeNull();

    assetId = data.createAsset.asset.id;
  });

  test("Upload a CSV asset linked to a project", async ({ gqlClient }) => {
    const csv = createTestCsv();

    const { data } = await gqlClient.uploadFile<{
      createAsset: {
        asset: { id: string; name: string; projectId: string; coreSupport: boolean };
      };
    }>(
      CREATE_ASSET,
      { workspaceId, projectId, file: null, coreSupport: true },
      csv,
      "data.csv",
      "text/csv"
    );

    expect(data.createAsset.asset.name).toBe("data.csv");
    expect(data.createAsset.asset.projectId).toBe(projectId);
  });

  test("List assets in workspace returns uploaded files", async ({ gqlClient }) => {
    const { data } = await gqlClient.query<{
      assets: {
        totalCount: number;
        nodes: { id: string; name: string; projectId: string | null }[];
      };
    }>(GET_ASSETS, {
      workspaceId,
      pagination: { first: 20 },
      sort: { field: "DATE", direction: "DESC" }
    });

    expect(data.assets.totalCount).toBeGreaterThanOrEqual(2);

    const names = data.assets.nodes.map(n => n.name);
    expect(names).toContain("test-image.png");
    expect(names).toContain("data.csv");
  });

  test("Filter assets by project returns only linked assets", async ({
    gqlClient
  }) => {
    const { data } = await gqlClient.query<{
      assets: { totalCount: number; nodes: { id: string; name: string }[] };
    }>(GET_ASSETS, {
      workspaceId,
      projectId,
      pagination: { first: 20 },
      sort: { field: "DATE", direction: "DESC" }
    });

    expect(data.assets.totalCount).toBeGreaterThanOrEqual(1);
    const names = data.assets.nodes.map(n => n.name);
    expect(names).toContain("data.csv");
    expect(names).not.toContain("test-image.png");
  });

  test("Move an asset to a different project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateAsset: { assetId: string; projectId: string };
    }>(UPDATE_ASSET, { input: { assetId, projectId } });

    expect(status).toBe(200);
    expect(data.updateAsset.assetId).toBe(assetId);
    expect(data.updateAsset.projectId).toBe(projectId);

    // Both assets should now belong to the project
    const { data: filtered } = await gqlClient.query<{
      assets: { totalCount: number; nodes: { id: string }[] };
    }>(GET_ASSETS, {
      workspaceId,
      projectId,
      pagination: { first: 20 },
      sort: { field: "DATE", direction: "DESC" }
    });

    expect(filtered.assets.totalCount).toBeGreaterThanOrEqual(2);
  });

  test("Unlink an asset from its project", async ({ gqlClient }) => {
    const { data } = await gqlClient.mutate<{
      updateAsset: { assetId: string; projectId: string | null };
    }>(UPDATE_ASSET, { input: { assetId, projectId: null } });

    expect(data.updateAsset.projectId).toBeNull();
  });

  test("Remove an asset permanently", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeAsset: { assetId: string };
    }>(REMOVE_ASSET, { input: { assetId } });

    expect(status).toBe(200);
    expect(data.removeAsset.assetId).toBe(assetId);
  });

  test("Removed asset no longer appears in listing", async ({ gqlClient }) => {
    const { data } = await gqlClient.query<{
      assets: { nodes: { id: string }[] };
    }>(GET_ASSETS, {
      workspaceId,
      pagination: { first: 50 },
      sort: { field: "DATE", direction: "DESC" }
    });

    const ids = data.assets.nodes.map(n => n.id);
    expect(ids).not.toContain(assetId);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Asset search by keyword
// ────────────────────────────────────────────────────────────────────────────

test.describe("Asset keyword search", () => {
  let workspaceId: string;
  const uniqueTag = faker.string.alphanumeric(8).toLowerCase();

  test("Setup: upload two assets with distinct names", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;

    const png = createTestPng();
    await gqlClient.uploadFile(
      CREATE_ASSET,
      { workspaceId, projectId: null, file: null, coreSupport: true },
      png,
      `searchable-${uniqueTag}.png`,
      "image/png"
    );

    const csv = createTestCsv();
    await gqlClient.uploadFile(
      CREATE_ASSET,
      { workspaceId, projectId: null, file: null, coreSupport: true },
      csv,
      `other-file-${uniqueTag}.csv`,
      "text/csv"
    );
  });

  test("Keyword filter narrows results to matching assets", async ({
    gqlClient
  }) => {
    const { data } = await gqlClient.query<{
      assets: { nodes: { id: string; name: string }[] };
    }>(GET_ASSETS, {
      workspaceId,
      keyword: `searchable-${uniqueTag}`,
      pagination: { first: 20 },
      sort: { field: "DATE", direction: "DESC" }
    });

    expect(data.assets.nodes.length).toBe(1);
    expect(data.assets.nodes[0].name).toBe(`searchable-${uniqueTag}.png`);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Asset sort ordering
// ────────────────────────────────────────────────────────────────────────────

test.describe("Asset sort ordering", () => {
  let workspaceId: string;

  test("Setup: get workspace", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;
  });

  test("Sort by NAME ascending returns alphabetical order", async ({
    gqlClient
  }) => {
    const { data } = await gqlClient.query<{
      assets: { nodes: { name: string }[] };
    }>(GET_ASSETS, {
      workspaceId,
      pagination: { first: 50 },
      sort: { field: "NAME", direction: "ASC" }
    });

    const names = data.assets.nodes.map(n => n.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Asset negative scenarios
// ────────────────────────────────────────────────────────────────────────────

test.describe("Asset negative scenarios", () => {
  let workspaceId: string;

  test("Setup: get workspace", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;
  });

  test("Cannot upload asset to a non-existent workspace", async ({
    gqlClient
  }) => {
    const fakeWsId = generateFakeId();
    const png = createTestPng();
    await expect(
      gqlClient.uploadFile(
        CREATE_ASSET,
        { workspaceId: fakeWsId, projectId: null, file: null, coreSupport: true },
        png,
        "orphan.png",
        "image/png"
      )
    ).rejects.toThrow();
  });

  test("Cannot remove a non-existent asset", async ({ gqlClient }) => {
    const fakeAssetId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_ASSET, { input: { assetId: fakeAssetId } })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent asset", async ({ gqlClient }) => {
    const fakeAssetId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_ASSET, {
        input: { assetId: fakeAssetId, projectId: null }
      })
    ).rejects.toThrow();
  });

  test("Keyword search with no matches returns empty list", async ({
    gqlClient
  }) => {
    const { data } = await gqlClient.query<{
      assets: { totalCount: number; nodes: { id: string }[] };
    }>(GET_ASSETS, {
      workspaceId,
      keyword: `no-match-ever-${faker.string.alphanumeric(20)}`,
      pagination: { first: 20 },
      sort: { field: "DATE", direction: "DESC" }
    });

    expect(data.assets.totalCount).toBe(0);
    expect(data.assets.nodes).toHaveLength(0);
  });

  test("Assets query with non-existent project fails", async ({
    gqlClient
  }) => {
    const fakeProjectId = generateFakeId();
    await expect(
      gqlClient.query(GET_ASSETS, {
        workspaceId,
        projectId: fakeProjectId,
        pagination: { first: 20 },
        sort: { field: "DATE", direction: "DESC" }
      })
    ).rejects.toThrow();
  });
});
