import fs from "fs";
import path from "path";

import { faker } from "@faker-js/faker";

import { GET_PROJECT_IMPORT_STATUS } from "../graphql/queries";

// Crockford Base32 charset used by oklog/ulid
const CROCKFORD = "0123456789abcdefghjkmnpqrstvwxyz";

// First char of a valid ULID is limited to 0-7 (48-bit timestamp constraint)
const ULID_FIRST_CHAR = CROCKFORD.slice(0, 8);

/**
 * Generates a fake but structurally valid ULID-like ID.
 * Ensures the first character is within the valid timestamp range (0-7)
 * so the server treats it as a well-formed ID that simply doesn't exist,
 * rather than rejecting it as malformed.
 */
export const generateFakeId = (): string =>
  faker.string.fromCharacters(ULID_FIRST_CHAR, 1) +
  faker.string.fromCharacters(CROCKFORD, 25);

const tokenPath = path.join(__dirname, "../../.auth/api-token.json");

/**
 * Returns auth headers for REST endpoint tests.
 * Reads from the same token file used by the GraphQL client fixture.
 */
export function getAuthHeaders(): Record<string, string> {
  const { token, extraHeaders } = JSON.parse(
    fs.readFileSync(tokenPath, "utf-8")
  );
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders
  };
}

/**
 * Builds a multipart/form-data body. Playwright's `multipart` option cannot
 * express a chunk of a larger file, which is what /api/split-import takes, so
 * the body is assembled here instead of inline in each test.
 */
export function buildMultipart(
  fields: Record<string, string>,
  file?: { name: string; filename: string; contentType: string; content: Buffer }
): { body: Buffer; contentType: string } {
  const boundary = `----FormBoundary${faker.string.alphanumeric(16)}`;
  const crlf = "\r\n";
  const parts: Buffer[] = [];

  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}` +
          `Content-Disposition: form-data; name="${name}"${crlf}${crlf}` +
          `${value}${crlf}`
      )
    );
  }

  if (file) {
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}` +
          `Content-Disposition: form-data; name="${file.name}"; filename="${file.filename}"${crlf}` +
          `Content-Type: ${file.contentType}${crlf}${crlf}`
      )
    );
    parts.push(file.content);
    parts.push(Buffer.from(crlf));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`));

  return {
    body: Buffer.concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

type ImportStatusResult = {
  importStatus: string | null;
  importResultLog: unknown;
};

/**
 * Polls a project's import status until it reaches `expected`, or fails with
 * the status and result log it actually reached. The import runs in a
 * background worker, so the upload response cannot tell us the outcome.
 */
export async function waitForImportStatus(
  gqlClient: {
    query: <T>(q: string, v?: Record<string, unknown>) => Promise<{ data: T }>;
  },
  projectId: string,
  expected: string,
  timeoutMs = 30000
): Promise<ImportStatusResult> {
  const deadline = Date.now() + timeoutMs;
  let last: ImportStatusResult = { importStatus: null, importResultLog: null };

  while (Date.now() < deadline) {
    const { data } = await gqlClient.query<{
      node: { metadata: ImportStatusResult | null } | null;
    }>(GET_PROJECT_IMPORT_STATUS, { projectId });

    last = data.node?.metadata ?? last;
    if (last.importStatus === expected) return last;
    if (last.importStatus === "FAILED" && expected !== "FAILED") break;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Only the message, not the whole result log: that carries the full scene
  // JSON and buries the failure in kilobytes of output.
  const reason =
    typeof last.importResultLog === "object" &&
    last.importResultLog !== null &&
    "message" in last.importResultLog
      ? String((last.importResultLog as { message: unknown }).message)
      : "no message recorded";

  throw new Error(
    `import status did not reach ${expected} within ${timeoutMs}ms; last status ${last.importStatus}: ${reason}`
  );
}
