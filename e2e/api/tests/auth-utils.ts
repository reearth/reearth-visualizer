import { APIRequestContext } from "@playwright/test";

import {
  AUTH_MODE,
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  MOCK_USER_ID
} from "../config/env";

type AuthResult = {
  token: string;
  extraHeaders: Record<string, string>;
};

async function getAuth0Token(request: APIRequestContext) {
  const email = process.env.REEARTH_E2E_EMAIL;
  const password = process.env.REEARTH_E2E_PASSWORD;
  if (!email || !password) throw new Error("Missing REEARTH_E2E_EMAIL or REEARTH_E2E_PASSWORD");
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) throw new Error("Missing Auth0 config");

  const res = await request.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
    headers: { "Content-Type": "application/json" },
    data: {
      grant_type: "password",
      username: email,
      password,
      audience: AUTH0_AUDIENCE,
      client_id: AUTH0_CLIENT_ID,
      scope: "openid profile email"
    }
  });

  if (!res.ok()) {
    throw new Error(`Auth0 failed (${res.status()}): ${await res.text()}`);
  }
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function getAuthToken(request: APIRequestContext): Promise<AuthResult> {
  if (AUTH_MODE === "mock") {
    if (!MOCK_USER_ID) throw new Error("REEARTH_E2E_MOCK_USER_ID required for mock mode");
    return { token: "test", extraHeaders: { "X-Reearth-Debug-User": MOCK_USER_ID } };
  }

  return { token: await getAuth0Token(request), extraHeaders: {} };
}
