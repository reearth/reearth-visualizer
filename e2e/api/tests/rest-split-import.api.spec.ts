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

import {
  buildMultipart,
  getAuthHeaders,
  waitForImportStatus
} from "./test-helpers";

test.describe.configure({ mode: "serial" });

/**
 * The server assembles chunks at fixed offsets, so every chunk except the last
 * must be exactly this size (see writeChunk in file_split_uploader.go). It is
 * the reason the multi-chunk cases below only cover session mechanics: a
 * successful multi-chunk import would need an export larger than 16 MiB.
 */
const CHUNK_SIZE = 16 * 1024 * 1024;

/**
 * The zip is produced by exporting a real project rather than hand-built, so
 * the test exercises the round trip the feature exists for and cannot drift
 * from the server's export format. The previous version assembled a zip byte
 * by byte with a hardcoded CRC-32 that was wrong, so every import it triggered
 * failed with "zip: checksum error" while the test still passed, because it
 * only ever asserted the upload response.
 */
test.describe("POST /api/split-import — chunked project import", () => {
  let workspaceId: string;
  let sourceProjectId: string;
  let importedProjectId: string;
  let exportedZip: Buffer;

  test.afterAll(async ({ gqlClient }) => {
    for (const projectId of [sourceProjectId, importedProjectId]) {
      if (!projectId) continue;
      try {
        await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
      } catch {
        // already deleted
      }
    }
  });

  test("Setup: export a project to import back", async ({
    gqlClient,
    request
  }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: `e2e-split-import ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    sourceProjectId = proj.createProject.project.id;
    await gqlClient.mutate(CREATE_SCENE, { input: { projectId: sourceProjectId } });

    const { data: exported } = await gqlClient.mutate<{
      exportProject: { projectDataPath: string };
    }>(EXPORT_PROJECT, { input: { projectId: sourceProjectId } });

    const path = exported.exportProject.projectDataPath;
    const res = await request.get(`${API_BASE_URL}${path}`);
    expect(res.status()).toBe(200);

    exportedZip = await res.body();
    // PK magic, i.e. this really is a zip before we start slicing it up.
    expect(exportedZip.subarray(0, 2).toString()).toBe("PK");
  });

  test("Imports a project uploaded as a single chunk", async ({
    request,
    gqlClient
  }) => {
    const fileId = faker.string.alphanumeric(16);
    const chunks = [exportedZip];

    const upload = async (chunkNum: number) => {
      const { body, contentType } = buildMultipart(
        {
          workspace_id: workspaceId,
          file_id: fileId,
          chunk_num: String(chunkNum),
          total_chunks: String(chunks.length)
        },
        {
          name: "file",
          filename: "import.zip",
          contentType: "application/zip",
          content: chunks[chunkNum]
        }
      );

      const res = await request.post(`${API_BASE_URL}/api/split-import`, {
        headers: { "Content-Type": contentType, ...getAuthHeaders() },
        data: body
      });
      expect(res.status()).toBe(200);
      return res.json();
    };

    const uploaded = await upload(0);
    expect(uploaded).toMatchObject({
      status: "chunk_received",
      file_id: fileId,
      chunk_num: 0,
      total: 1,
      completed: true
    });
    expect(uploaded.project_id).toBeTruthy();
    importedProjectId = uploaded.project_id;

    // The import itself runs in a background worker, so the upload response
    // says nothing about whether it worked. This is the assertion the old
    // version was missing.
    const status = await waitForImportStatus(
      gqlClient,
      importedProjectId,
      "SUCCESS"
    );
    expect(status.importStatus).toBe("SUCCESS");
  });

  test("Rejects a chunk for an unknown upload session", async ({ request }) => {
    const { body, contentType } = buildMultipart(
      {
        workspace_id: workspaceId,
        file_id: faker.string.alphanumeric(16),
        chunk_num: "1",
        total_chunks: "2"
      },
      {
        name: "file",
        filename: "import.zip",
        contentType: "application/zip",
        content: exportedZip.subarray(0, 32)
      }
    );

    const res = await request.post(`${API_BASE_URL}/api/split-import`, {
      headers: { "Content-Type": contentType, ...getAuthHeaders() },
      data: body
    });

    expect(res.status()).toBe(400);
    expect(await res.text()).toContain("unknown or expired upload session");
  });

  test("Enforces the fixed chunk size and a stable total_chunks", async ({
    request
  }) => {
    const fileId = faker.string.alphanumeric(16);

    const post = async (
      totalChunks: number,
      chunkNum: number,
      content: Buffer
    ) => {
      const { body, contentType } = buildMultipart(
        {
          workspace_id: workspaceId,
          file_id: fileId,
          chunk_num: String(chunkNum),
          total_chunks: String(totalChunks)
        },
        {
          name: "file",
          filename: "import.zip",
          contentType: "application/zip",
          content
        }
      );
      return request.post(`${API_BASE_URL}/api/split-import`, {
        headers: { "Content-Type": contentType, ...getAuthHeaders() },
        data: body
      });
    };

    // A non-final chunk shorter than CHUNK_SIZE is refused. The server answers
    // 500 today even though the caller is at fault; asserting on the class
    // rather than the code so this does not bless that status.
    const short = await post(2, 0, exportedZip);
    expect(short.status()).toBeGreaterThanOrEqual(400);

    // A correctly sized non-final chunk opens the session.
    const opened = await post(2, 0, Buffer.alloc(CHUNK_SIZE));
    expect(opened.status()).toBe(200);
    expect(await opened.json()).toMatchObject({ chunk_num: 0, completed: false });

    // Changing total_chunks mid-session is refused.
    const changed = await post(3, 1, exportedZip);
    expect(changed.status()).toBe(400);
    expect(await changed.text()).toContain("total_chunks does not match");
  });

  test("Requires workspace_id", async ({ request }) => {
    const { body, contentType } = buildMultipart({
      file_id: faker.string.alphanumeric(16),
      chunk_num: "0",
      total_chunks: "1"
    });

    const res = await request.post(`${API_BASE_URL}/api/split-import`, {
      headers: { "Content-Type": contentType, ...getAuthHeaders() },
      data: body
    });

    expect(res.status()).toBe(400);
  });
});
