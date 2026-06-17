import fs from "fs";
import path from "path";

import { APIRequestContext, test as setup } from "@playwright/test";

import { AUTH_MODE } from "./config/env";
import { GraphQLClient } from "./graphql/client";
import { CREATE_WORKSPACE } from "./graphql/mutations";
import { GET_ME } from "./graphql/queries";
import { getAuthToken } from "./tests/auth-utils";

const tokenPath = path.join(__dirname, "../.auth/api-token.json");
const storagePath = path.join(__dirname, "../.auth/user.json");
const workspacePath = path.join(__dirname, "../.auth/workspace.json");

const runId = process.env.GITHUB_RUN_ID ?? "local";
export const E2E_WORKSPACE_NAME = `e2e-viz-${runId}`;

setup("acquire API auth token", async ({ request }) => {
  fs.mkdirSync(path.dirname(tokenPath), { recursive: true });

  if (AUTH_MODE === "auth0" && fs.existsSync(storagePath)) {
    const token = extractTokenFromStorage(storagePath);
    if (token) {
      fs.writeFileSync(
        tokenPath,
        JSON.stringify({ token, extraHeaders: {} }, null, 2)
      );
      await createTestWorkspace(request, token, {});
      return;
    }
  }

  const auth = await getAuthToken(request);
  fs.writeFileSync(tokenPath, JSON.stringify(auth, null, 2));
  await createTestWorkspace(request, auth.token, auth.extraHeaders);
});

async function createTestWorkspace(
  request: APIRequestContext,
  token: string,
  extraHeaders: Record<string, string>
) {
  console.log(`[setup] Creating workspace "${E2E_WORKSPACE_NAME}" via ${process.env.REEARTH_E2E_API_URL}`);
  const client = new GraphQLClient(request, token, extraHeaders);

  const { data: meData } = await client.query<{ me: { id: string; email: string; myWorkspaceId: string } }>(GET_ME);
  console.log(`[setup] Authenticated as: id=${meData.me.id} email=${meData.me.email} myWorkspaceId=${meData.me.myWorkspaceId}`);

  const { data } = await client.mutate<{
    createWorkspace: { workspace: { id: string; name: string } };
  }>(CREATE_WORKSPACE, { input: { name: E2E_WORKSPACE_NAME } });

  const workspaceId = data.createWorkspace.workspace.id;
  fs.writeFileSync(
    workspacePath,
    JSON.stringify({ workspaceId, name: E2E_WORKSPACE_NAME }, null, 2)
  );
  console.log(
    `[setup] Created test workspace "${E2E_WORKSPACE_NAME}" (${workspaceId})`
  );
}

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
