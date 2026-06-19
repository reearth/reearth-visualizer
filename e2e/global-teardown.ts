import fs from "fs";
import path from "path";

import { FullConfig, request } from "@playwright/test";

import { GraphQLClient } from "./api/graphql/client";
import { DELETE_PROJECT, UPDATE_PROJECT } from "./api/graphql/mutations";
import { GET_ME, GET_PROJECTS, GET_DELETED_PROJECTS } from "./api/graphql/queries";

const E2E_PROJECT_PREFIX = "e2e-";

const apiTokenPath = path.join(__dirname, ".auth/api-token.json");
const storagePath = path.join(__dirname, ".auth/user.json");

function loadAuthToken(): { token: string; extraHeaders: Record<string, string> } | null {
  if (fs.existsSync(apiTokenPath)) {
    try {
      return JSON.parse(fs.readFileSync(apiTokenPath, "utf-8"));
    } catch {
      // malformed
    }
  }

  if (fs.existsSync(storagePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
      for (const origin of state.origins ?? []) {
        for (const item of origin.localStorage ?? []) {
          if (!item.name.startsWith("@@auth0spajs@@") || !item.value) continue;
          const parsed = JSON.parse(item.value);
          if (parsed?.body?.access_token) {
            return { token: parsed.body.access_token, extraHeaders: {} };
          }
        }
      }
    } catch {
      // malformed
    }
  }

  return null;
}

async function globalTeardown(_config: FullConfig) {
  const auth = loadAuthToken();
  if (!auth) {
    console.log("[teardown] No auth token found — skipping e2e project cleanup.");
    return;
  }

  const ctx = await request.newContext().catch((err) => {
    console.warn("[teardown] Could not create request context (non-fatal):", err);
    return null;
  });
  if (!ctx) return;
  try {
    const client = new GraphQLClient(ctx, auth.token, auth.extraHeaders);

    const { data: meData } = await client.query<{ me: { myWorkspaceId: string } }>(GET_ME);
    const workspaceId = meData.me.myWorkspaceId;

    // Collect active e2e projects
    const { data: activeData } = await client.query<{
      projects: { nodes: { id: string; name: string }[] };
    }>(GET_PROJECTS, {
      workspaceId,
      pagination: { first: 500 },
      keyword: E2E_PROJECT_PREFIX
    });

    const activeProjects = activeData.projects.nodes.filter((p) =>
      p.name.startsWith(E2E_PROJECT_PREFIX)
    );

    // Collect soft-deleted e2e projects (recycle bin)
    const { data: deletedData } = await client
      .query<{ deletedProjects: { nodes: { id: string; name: string }[] } }>(
        GET_DELETED_PROJECTS,
        { workspaceId }
      )
      .catch(() => ({ data: { deletedProjects: { nodes: [] } } }));

    const deletedProjects = deletedData.deletedProjects.nodes.filter((p) =>
      p.name.startsWith(E2E_PROJECT_PREFIX)
    );

    const all = [...activeProjects, ...deletedProjects];

    if (all.length === 0) {
      console.log("[teardown] No leaked e2e projects found.");
      return;
    }

    console.log(`[teardown] Cleaning up ${all.length} leaked e2e project(s)…`);

    for (const project of all) {
      await client
        .mutate(UPDATE_PROJECT, { input: { projectId: project.id, deleted: true } })
        .catch(() => {});
      await client
        .mutate(DELETE_PROJECT, { input: { projectId: project.id } })
        .catch((err) => {
          console.warn(`[teardown] Could not delete "${project.name}" (${project.id}):`, err);
        });
    }

    console.log("[teardown] e2e project cleanup complete.");
  } catch (err) {
    // Best-effort: never let teardown failures mask a green suite
    console.warn("[teardown] Cleanup error (non-fatal):", err);
  } finally {
    await ctx.dispose();
  }
}

export default globalTeardown;
