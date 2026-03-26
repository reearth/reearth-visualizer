import fs from "fs";
import path from "path";

import { faker } from "@faker-js/faker";

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
