import fs from "fs";
import path from "path";

import { faker } from "@faker-js/faker";

import {
  GET_PROJECT_IMPORT_STATUS,
  GET_PROJECT_IMPORT_RESULT_LOG
} from "../graphql/queries";

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
  file?: {
    name: string;
    filename: string;
    contentType: string;
    content: Buffer;
  }
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

// Terminal import states never change once reached, so polling past one is
// pointless.
const TERMINAL_STATUSES = new Set(["SUCCESS", "FAILED"]);

/**
 * Polls a project's import status until it reaches `expected`, then returns it.
 * The import runs in a background worker, so the upload response cannot tell us
 * the outcome. Polls the status alone; if the wait ends without reaching
 * `expected` (a different terminal status, or timeout) it fetches the result log
 * once and throws with the status it actually reached and that log's message.
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
  let lastStatus: string | null = null;

  while (Date.now() < deadline) {
    const { data } = await gqlClient.query<{
      node: { metadata: { importStatus: string | null } | null } | null;
    }>(GET_PROJECT_IMPORT_STATUS, { projectId });

    lastStatus = data.node?.metadata?.importStatus ?? lastStatus;
    if (lastStatus === expected) {
      return { importStatus: lastStatus, importResultLog: null };
    }
    // A terminal status other than the expected one will never change, so stop
    // now instead of waiting out the timeout.
    if (lastStatus !== null && TERMINAL_STATUSES.has(lastStatus)) break;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Fetch the result log only now, once, and surface only its message: the log
  // itself can carry the full scene JSON and would bury the failure.
  const { data } = await gqlClient.query<{
    node: { metadata: ImportStatusResult | null } | null;
  }>(GET_PROJECT_IMPORT_RESULT_LOG, { projectId });
  const log = data.node?.metadata?.importResultLog ?? null;
  const reason =
    typeof log === "object" && log !== null && "message" in log
      ? String((log as { message: unknown }).message)
      : "no message recorded";

  throw new Error(
    `import status did not reach ${expected} within ${timeoutMs}ms; last status ${lastStatus}: ${reason}`
  );
}
