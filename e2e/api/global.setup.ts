import fs from "fs";
import path from "path";

import { test as setup } from "@playwright/test";

import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH_MODE } from "./config/env";
import { getAuthToken } from "./tests/auth-utils";

const tokenPath = path.join(__dirname, "../.auth/api-token.json");
const storagePath = path.join(__dirname, "../.auth/user.json");

setup("acquire API auth token", async ({ request }) => {
  fs.mkdirSync(path.dirname(tokenPath), { recursive: true });

  // The web SPA token in user.json may be issued for a different API than
  // REEARTH_E2E_API_URL (e.g. a PR preview), so only fall back to it when the
  // password grant isn't configured.
  const hasAuth0Config = !!AUTH0_DOMAIN && !!AUTH0_CLIENT_ID;
  if (AUTH_MODE === "auth0" && !hasAuth0Config && fs.existsSync(storagePath)) {
    const token = extractTokenFromStorage(storagePath);
    if (token) {
      fs.writeFileSync(
        tokenPath,
        JSON.stringify({ token, extraHeaders: {} }, null, 2)
      );
      return;
    }
  }

  const auth = await getAuthToken(request);
  fs.writeFileSync(tokenPath, JSON.stringify(auth, null, 2));
});

function extractTokenFromStorage(filePath: string): string | null {
  try {
    const state = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    for (const origin of state.origins ?? []) {
      for (const item of origin.localStorage ?? []) {
        if (!item.name.startsWith("@@auth0spajs@@") || !item.value) continue;
        const parsed = JSON.parse(item.value);
        if (parsed?.body?.access_token) return parsed.body.access_token;
      }
    }
  } catch {
    // storage state not available or malformed, fall through
  }
  return null;
}
