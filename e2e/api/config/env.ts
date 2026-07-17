import path from "path";

import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const baseUrl = process.env.REEARTH_WEB_E2E_BASEURL;
if (!baseUrl) throw new Error("Missing REEARTH_WEB_E2E_BASEURL");

export const BASE_URL = baseUrl.replace(/\/$/, "");

const apiUrl = process.env.REEARTH_E2E_API_URL;
if (!apiUrl) throw new Error("Missing REEARTH_E2E_API_URL");

export const API_BASE_URL = apiUrl.replace(/\/$/, "");
export const GRAPHQL_ENDPOINT = `${API_BASE_URL}/api/graphql`;

export const AUTH_MODE =
  (process.env.REEARTH_E2E_AUTH_MODE as "auth0" | "mock") ?? "auth0";

export const AUTH0_DOMAIN = process.env.REEARTH_E2E_AUTH0_DOMAIN ?? "";
export const AUTH0_AUDIENCE = process.env.REEARTH_E2E_AUTH0_AUDIENCE ?? "";
export const AUTH0_CLIENT_ID = process.env.REEARTH_E2E_AUTH0_CLIENT_ID ?? "";
export const MOCK_USER_ID = process.env.REEARTH_E2E_MOCK_USER_ID ?? "";
export const SECOND_USER_EMAIL = process.env.REEARTH_E2E_SECOND_USER_EMAIL ?? "";
