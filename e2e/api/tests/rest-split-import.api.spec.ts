import { faker } from "@faker-js/faker";

import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";
import { DELETE_PROJECT } from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

import { getAuthHeaders } from "./test-helpers";

/**
 * Build a minimal valid ZIP buffer containing a valid JSON project.json.
 * Uses valid JSON content so the server import pipeline can process it
 * and session cleanup runs properly.
 */
function createMinimalZip(): Buffer {
  const fileName = Buffer.from("project.json");
  const fileContent = Buffer.from("{}", "utf-8");

  // Local file header
  const localHeader = Buffer.alloc(30 + fileName.length);
  localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
  localHeader.writeUInt16LE(20, 4); // Version needed to extract
  localHeader.writeUInt16LE(0, 6); // General purpose bit flag
  localHeader.writeUInt16LE(0, 8); // Compression method (stored)
  localHeader.writeUInt16LE(0, 10); // Last mod file time
  localHeader.writeUInt16LE(0, 12); // Last mod file date
  // CRC-32 for "{}" = 0xFC5C45BE
  localHeader.writeUInt32LE(0xfc5c45be, 14); // CRC-32
  localHeader.writeUInt32LE(fileContent.length, 18); // Compressed size
  localHeader.writeUInt32LE(fileContent.length, 22); // Uncompressed size
  localHeader.writeUInt16LE(fileName.length, 26); // File name length
  localHeader.writeUInt16LE(0, 28); // Extra field length
  fileName.copy(localHeader, 30);

  // Central directory header
  const centralDir = Buffer.alloc(46 + fileName.length);
  centralDir.writeUInt32LE(0x02014b50, 0); // Central directory header signature
  centralDir.writeUInt16LE(20, 4); // Version made by
  centralDir.writeUInt16LE(20, 6); // Version needed to extract
  centralDir.writeUInt16LE(0, 8); // General purpose bit flag
  centralDir.writeUInt16LE(0, 10); // Compression method
  centralDir.writeUInt16LE(0, 12); // Last mod file time
  centralDir.writeUInt16LE(0, 14); // Last mod file date
  centralDir.writeUInt32LE(0xfc5c45be, 16); // CRC-32
  centralDir.writeUInt32LE(fileContent.length, 20); // Compressed size
  centralDir.writeUInt32LE(fileContent.length, 24); // Uncompressed size
  centralDir.writeUInt16LE(fileName.length, 28); // File name length
  centralDir.writeUInt16LE(0, 30); // Extra field length
  centralDir.writeUInt16LE(0, 32); // File comment length
  centralDir.writeUInt16LE(0, 34); // Disk number start
  centralDir.writeUInt16LE(0, 36); // Internal file attributes
  centralDir.writeUInt32LE(0, 38); // External file attributes
  centralDir.writeUInt32LE(0, 42); // Relative offset of local header
  fileName.copy(centralDir, 46);

  // End of central directory
  const localDataSize = localHeader.length + fileContent.length;
  const endOfCentralDir = Buffer.alloc(22);
  endOfCentralDir.writeUInt32LE(0x06054b50, 0); // End of central directory signature
  endOfCentralDir.writeUInt16LE(0, 4); // Number of this disk
  endOfCentralDir.writeUInt16LE(0, 6); // Disk where central directory starts
  endOfCentralDir.writeUInt16LE(1, 8); // Number of central directory records on this disk
  endOfCentralDir.writeUInt16LE(1, 10); // Total number of central directory records
  endOfCentralDir.writeUInt32LE(centralDir.length, 12); // Size of central directory
  endOfCentralDir.writeUInt32LE(localDataSize, 16); // Offset of start of central directory
  endOfCentralDir.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([localHeader, fileContent, centralDir, endOfCentralDir]);
}

test.describe.configure({ mode: "serial" });

test.describe("POST /api/split-import — chunked project import", () => {
  let workspaceId: string;
  let createdProjectId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (createdProjectId) {
      try {
        await gqlClient.mutate(DELETE_PROJECT, {
          input: { projectId: createdProjectId }
        });
      } catch {
        // already deleted
      }
    }
  });

  test("Setup: get workspace", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;
  });

  test("Upload a single-chunk import", async ({ request }) => {
    const zipBuffer = createMinimalZip();
    const fileId = faker.string.alphanumeric(16);
    const boundary = `----FormBoundary${Date.now()}`;
    const crlf = "\r\n";

    const parts: Buffer[] = [];
    const addField = (name: string, value: string) => {
      parts.push(
        Buffer.from(
          `--${boundary}${crlf}` +
            `Content-Disposition: form-data; name="${name}"${crlf}${crlf}` +
            `${value}${crlf}`
        )
      );
    };

    addField("workspace_id", workspaceId);
    addField("file_id", fileId);
    addField("chunk_num", "0");
    addField("total_chunks", "1");

    // File part
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}` +
          `Content-Disposition: form-data; name="file"; filename="import.zip"${crlf}` +
          `Content-Type: application/zip${crlf}${crlf}`
      )
    );
    parts.push(zipBuffer);
    parts.push(Buffer.from(`${crlf}--${boundary}--${crlf}`));

    const body = Buffer.concat(parts);

    const res = await request.post(`${API_BASE_URL}/api/split-import`, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        ...getAuthHeaders()
      },
      data: body
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("status", "chunk_received");
    expect(json).toHaveProperty("file_id", fileId);
    expect(json).toHaveProperty("chunk_num", 0);
    expect(json).toHaveProperty("total", 1);
    expect(json).toHaveProperty("completed", true);
    expect(json).toHaveProperty("project_id");
    createdProjectId = json.project_id;
  });

  test("Split-import without workspace_id returns 400", async ({
    request
  }) => {
    const boundary = `----FormBoundary${Date.now()}`;
    const crlf = "\r\n";

    const parts: Buffer[] = [];
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}` +
          `Content-Disposition: form-data; name="file_id"${crlf}${crlf}` +
          `test${crlf}`
      )
    );
    parts.push(Buffer.from(`--${boundary}--${crlf}`));

    const body = Buffer.concat(parts);

    const res = await request.post(`${API_BASE_URL}/api/split-import`, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        ...getAuthHeaders()
      },
      data: body
    });

    expect(res.status()).toBe(400);
  });
});
