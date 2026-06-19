import { faker } from "@faker-js/faker";

import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  EXPORT_PROJECT
} from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

test.describe.configure({ mode: "serial" });

test.describe("GET /export/:filename — project export download", () => {
  let projectId: string;
  let exportPath: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project with scene and export it", async ({
    gqlClient
  }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: `Export Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    await gqlClient.mutate(CREATE_SCENE, { input: { projectId } });

    const { data: exp } = await gqlClient.mutate<{
      exportProject: { projectDataPath: string };
    }>(EXPORT_PROJECT, { input: { projectId } });

    exportPath = exp.exportProject.projectDataPath;
    expect(exportPath).toBeTruthy();
  });

  test("Download the exported project file", async ({ request }) => {
    // exportPath may be a full URL or relative path like /export/filename.zip
    let downloadUrl: string;
    try {
      const parsed = new URL(exportPath);
      downloadUrl = parsed.pathname;
    } catch {
      downloadUrl = exportPath;
    }

    const res = await request.get(`${API_BASE_URL}${downloadUrl}`);

    expect(res.status()).toBe(200);
    const body = await res.body();
    // ZIP files start with PK magic bytes (0x50, 0x4B)
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toBe(0x50); // P
    expect(body[1]).toBe(0x4b); // K
  });

  test("GET /export/non-existent-file returns 404", async ({ request }) => {
    const res = await request.get(
      `${API_BASE_URL}/export/no-such-file-${faker.string.alphanumeric(20)}.zip`
    );

    expect(res.status()).toBe(404);
  });
});
