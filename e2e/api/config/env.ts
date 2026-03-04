import path from "path";

import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const baseUrl = process.env.REEARTH_WEB_E2E_BASEURL;
if (!baseUrl) throw new Error("Missing REEARTH_WEB_E2E_BASEURL");

export const BASE_URL = baseUrl.replace(/\/$/, "");

// The GraphQL API lives on a separate host (api.<domain>), not on the frontend.
// Derive it from the config endpoint, or fall back to REEARTH_E2E_API_URL if set.
export const GRAPHQL_ENDPOINT =
  process.env.REEARTH_E2E_API_URL?.replace(/\/$/, "").concat("/graphql") ??
  deriveApiEndpoint(BASE_URL);

function deriveApiEndpoint(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hostname = `api.${parsed.hostname}`;
    return `${parsed.origin}/api/graphql`;
  } catch {
    return `${url}/api/graphql`;
  }
}

export const AUTH_MODE =
  (process.env.REEARTH_E2E_AUTH_MODE as "auth0" | "mock") ?? "auth0";

export const AUTH0_DOMAIN = process.env.REEARTH_E2E_AUTH0_DOMAIN ?? "";
export const AUTH0_AUDIENCE = process.env.REEARTH_E2E_AUTH0_AUDIENCE ?? "";
export const AUTH0_CLIENT_ID = process.env.REEARTH_E2E_AUTH0_CLIENT_ID ?? "";
export const MOCK_USER_ID = process.env.REEARTH_E2E_MOCK_USER_ID ?? "";
