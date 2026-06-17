import fs from "fs";
import path from "path";

import { FullConfig, request } from "@playwright/test";

import { GQLResult, GraphQLClient } from "./api/graphql/client";
import { DELETE_PROJECT, DELETE_WORKSPACE } from "./api/graphql/mutations";
import { GET_ME, GET_PROJECTS, GET_DELETED_PROJECTS } from "./api/graphql/queries";

const apiTokenPath = path.join(__dirname, ".auth/api-token.json");
const storagePath = path.join(__dirname, ".auth/user.json");
const workspacePath = path.join(__dirname, ".auth/workspace.json");

function loadAuthToken(): {
  token: string;
  extraHeaders: Record<string, string>;
} | null {
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

function loadTestWorkspace(): { workspaceId: string; name: string } | null {
  if (!fs.existsSync(workspacePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(workspacePath, "utf-8"));
  } catch {
    return null;
  }
}

async function deleteAllProjectsInWorkspace(
  client: GraphQLClient,
  workspaceId: string
): Promise<void> {
  // Delete active projects
  const { data } = await client.query<{
    projects: { nodes: { id: string; name: string }[] };
  }>(GET_PROJECTS, {
    workspaceId,
    pagination: { first: 1000 }
  });

  for (const project of data.projects.nodes) {
    await client
      .mutate(DELETE_PROJECT, { input: { projectId: project.id } })
      .then(() =>
        console.log(`[teardown] Deleted project "${project.name}" (${project.id})`)
      )
      .catch((err) =>
        console.warn(`[teardown] Could not delete project "${project.name}":`, err)
      );
  }

  // Delete soft-deleted projects (paginated)
  let cursor: string | null = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const res: GQLResult<{
      deletedProjects: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: { id: string; name: string }[];
      };
    }> = await client.query(GET_DELETED_PROJECTS, {
      workspaceId,
      pagination: { first: 100, ...(cursor ? { after: cursor } : {}) }
    });

    for (const project of res.data.deletedProjects.nodes) {
      await client
        .mutate(DELETE_PROJECT, { input: { projectId: project.id } })
        .then(() =>
          console.log(`[teardown] Deleted soft-deleted project "${project.name}" (${project.id})`)
        )
        .catch((err) =>
          console.warn(`[teardown] Could not delete soft-deleted project "${project.name}":`, err)
        );
    }

    hasNextPage = res.data.deletedProjects.pageInfo.hasNextPage;
    cursor = res.data.deletedProjects.pageInfo.endCursor;
    if (!cursor) break;
  }
}

async function cleanupPersonalWorkspaceSoftDeleted(
  client: GraphQLClient
): Promise<void> {
  const email = process.env.REEARTH_E2E_EMAIL;
  if (!email) return;

  console.log(`[teardown] Cleaning soft-deleted projects for ${email}...`);

  const { data: meData } = await client.query<{ me: { myWorkspaceId: string } }>(GET_ME);
  const workspaceId = meData.me.myWorkspaceId;

  let cursor: string | null = null;
  let hasNextPage = true;
  let deleted = 0;

  while (hasNextPage) {
    const res: GQLResult<{
      deletedProjects: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: { id: string; name: string }[];
      };
    }> = await client.query(GET_DELETED_PROJECTS, {
      workspaceId,
      pagination: { first: 100, ...(cursor ? { after: cursor } : {}) }
    });

    for (const project of res.data.deletedProjects.nodes) {
      await client
        .mutate(DELETE_PROJECT, { input: { projectId: project.id } })
        .then(() => {
          console.log(`[teardown] Deleted soft-deleted "${project.name}" (${project.id})`);
          deleted++;
        })
        .catch((err) =>
          console.warn(`[teardown] Could not delete "${project.name}":`, err)
        );
    }

    hasNextPage = res.data.deletedProjects.pageInfo.hasNextPage;
    cursor = res.data.deletedProjects.pageInfo.endCursor;
    if (!cursor) break;
  }

  console.log(`[teardown] Personal workspace cleanup done — ${deleted} project(s) deleted.`);
}

async function globalTeardown(_config: FullConfig) {
  const auth = loadAuthToken();
  if (!auth) {
    console.log("[teardown] No auth token found — skipping cleanup.");
    return;
  }

  const workspace = loadTestWorkspace();
  if (!workspace) {
    console.log("[teardown] No test workspace found — skipping cleanup.");
    return;
  }

  const ctx = await request.newContext().catch((err) => {
    console.warn(
      "[teardown] Could not create request context (non-fatal):",
      err
    );
    return null;
  });
  if (!ctx) return;

  try {
    const client = new GraphQLClient(ctx, auth.token, auth.extraHeaders);
    const { workspaceId, name } = workspace;

    console.log(`[teardown] Cleaning up test workspace "${name}" (${workspaceId})...`);

    await deleteAllProjectsInWorkspace(client, workspaceId);

    await client
      .mutate(DELETE_WORKSPACE, { input: { workspaceId } })
      .then(() =>
        console.log(`[teardown] Deleted workspace "${name}" (${workspaceId})`)
      )
      .catch((err) =>
        console.warn(`[teardown] Could not delete workspace "${name}":`, err)
      );

    console.log("[teardown] Workspace cleanup complete.");

    await cleanupPersonalWorkspaceSoftDeleted(client);
  } catch (err) {
    // Best-effort: never let teardown failures mask a green suite
    console.warn("[teardown] Cleanup error (non-fatal):", err);
  } finally {
    await ctx.dispose();
  }
}

export default globalTeardown;
