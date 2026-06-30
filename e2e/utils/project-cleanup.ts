import fs from "fs";
import path from "path";

import { APIRequestContext } from "@playwright/test";

import { GraphQLClient, GQLResult } from "../api/graphql/client";
import { DELETE_PROJECT, UPDATE_PROJECT } from "../api/graphql/mutations";
import {
  GET_ME,
  GET_DELETED_PROJECTS,
  GET_PROJECTS
} from "../api/graphql/queries";

const apiTokenPath = path.join(__dirname, "../.auth/api-token.json");
const storagePath = path.join(__dirname, "../.auth/user.json");

/**
 * Try to obtain an auth token from either the API token file or the
 * browser storage state (Auth0 access_token). This ensures cleanup works
 * regardless of which Playwright project (webkit / api-tests) ran first.
 */
function getAuthToken(): {
  token: string;
  extraHeaders: Record<string, string>;
} {
  // 1. Try api-token.json (written by api global setup)
  if (fs.existsSync(apiTokenPath)) {
    try {
      return JSON.parse(fs.readFileSync(apiTokenPath, "utf-8"));
    } catch {
      // malformed, fall through
    }
  }

  // 2. Try extracting from browser storage state (written by web global setup)
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
      // malformed, fall through
    }
  }

  throw new Error(
    "Project cleanup: no auth token found. Neither .auth/api-token.json nor .auth/user.json contain a valid token."
  );
}

/**
 * Delete a project by name via the GraphQL API.
 * Performs soft-delete (move to recycle bin) then permanent delete.
 * Logs warnings on failure instead of silently swallowing errors.
 */
export async function deleteProjectByName(
  request: APIRequestContext,
  projectName: string
): Promise<void> {
  try {
    const { token, extraHeaders } = getAuthToken();
    const client = new GraphQLClient(request, token, extraHeaders);

    // Get workspace ID
    const { data: meData } = await client.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    const workspaceId = meData.me.myWorkspaceId;

    // Find active projects by name
    const { data: projectsData } = await client.query<{
      projects: { nodes: { id: string; name: string }[] };
    }>(GET_PROJECTS, {
      workspaceId,
      pagination: { first: 100 },
      keyword: projectName
    });

    const activeProjects = projectsData.projects.nodes.filter(
      (p) => p.name === projectName
    );

    // Also find soft-deleted projects (in recycle bin), paginating through all pages
    const deletedProjects: { id: string; name: string }[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;
    while (hasNextPage) {
      let res: GQLResult<{
        deletedProjects: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: { id: string; name: string }[];
        };
      }>;
      try {
        res = await client.query(GET_DELETED_PROJECTS, {
          workspaceId,
          pagination: { first: 100, ...(cursor ? { after: cursor } : {}) }
        });
      } catch {
        break;
      }
      const matched = res.data.deletedProjects.nodes.filter(
        (p) => p.name === projectName
      );
      deletedProjects.push(...matched);
      hasNextPage = res.data.deletedProjects.pageInfo.hasNextPage;
      cursor = res.data.deletedProjects.pageInfo.endCursor;
      if (!cursor) break;
    }

    const allProjects = [...activeProjects, ...deletedProjects];

    if (allProjects.length === 0) {
      console.log(
        `[cleanup] Project "${projectName}" not found — may have been deleted already.`
      );
      return;
    }

    for (const project of allProjects) {
      // Soft delete first (no-op if already in recycle bin)
      await client
        .mutate(UPDATE_PROJECT, {
          input: { projectId: project.id, deleted: true }
        })
        .catch(() => {});

      // Permanent delete
      await client
        .mutate(DELETE_PROJECT, {
          input: { projectId: project.id }
        })
        .catch((err) => {
          console.warn(
            `[cleanup] Failed to permanently delete project "${projectName}" (${project.id}):`,
            err
          );
        });
    }

    console.log(
      `[cleanup] Deleted ${allProjects.length} project(s) named "${projectName}".`
    );
  } catch (err) {
    console.warn(`[cleanup] Could not clean up project "${projectName}":`, err);
  }
}

/**
 * Delete multiple projects by name via the GraphQL API.
 */
export async function deleteProjectsByName(
  request: APIRequestContext,
  projectNames: string[]
): Promise<void> {
  for (const name of projectNames) {
    await deleteProjectByName(request, name);
  }
}

/**
 * Returns the total number of projects currently in the recycle bin.
 * Used in global setup to warn when stale deleted projects may cause
 * recycle bin tests to fail (first page is 16 items).
 */
export async function getRecycleBinCount(
  request: APIRequestContext
): Promise<number | undefined> {
  try {
    const { token, extraHeaders } = getAuthToken();
    const client = new GraphQLClient(request, token, extraHeaders);

    const { data: meData } = await client.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    const workspaceId = meData.me.myWorkspaceId;

    const { data } = await client.query<{
      deletedProjects: { totalCount: number };
    }>(GET_DELETED_PROJECTS, {
      workspaceId,
      pagination: { first: 1 }
    });

    return data.deletedProjects.totalCount;
  } catch (err) {
    console.warn("[recycle-bin-count] Failed to get count:", err);
    return;
  }
}

/**
 * Permanently deletes all projects in the recycle bin.
 * Called from global setup when count >= 16 to prevent recycle bin tests from failing.
 */
export async function cleanupRecycleBin(
  request: APIRequestContext
): Promise<void> {
  try {
    const { token, extraHeaders } = getAuthToken();
    const client = new GraphQLClient(request, token, extraHeaders);

    const { data: meData } = await client.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    const workspaceId = meData.me.myWorkspaceId;

    const FETCH_ONE = `
      query($workspaceId: ID!, $pagination: Pagination) {
        deletedProjects(workspaceId: $workspaceId, pagination: $pagination) {
          totalCount
          pageInfo { hasNextPage endCursor }
          nodes { id name }
        }
      }
    `;

    type DeletedPage = {
      deletedProjects: {
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: { id: string; name: string }[];
      };
    };

    // Phase 1: collect all IDs via cursor-based pagination
    const ids: string[] = [];
    let cursor: string | null = null;
    let total = 0;
    let page: DeletedPage;

    do {
      ({ data: page } = await client.query<DeletedPage>(FETCH_ONE, {
        workspaceId,
        pagination: { first: 1, ...(cursor ? { after: cursor } : {}) }
      }));

      total = page.deletedProjects.totalCount;
      ids.push(...page.deletedProjects.nodes.map((p) => p.id));
      cursor = page.deletedProjects.pageInfo.hasNextPage
        ? page.deletedProjects.pageInfo.endCursor
        : null;
    } while (cursor);

    if (ids.length === 0) return;

    // Phase 2: delete in parallel chunks of 10
    const CHUNK = 10;
    let deleted = 0;
    for (let i = 0; i < ids.length; i += CHUNK) {
      const chunk = ids.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map((id) =>
          client
            .mutate(DELETE_PROJECT, { input: { projectId: id } })
            .then(() => true)
            .catch((err) => {
              console.warn(
                `[recycle-bin-cleanup] Failed to delete ${id}:`,
                err
              );
              return false;
            })
        )
      );
      deleted += results.filter(Boolean).length;
    }

    console.log(
      `[recycle-bin-cleanup] Permanently deleted ${deleted}/${total} project(s).`
    );
  } catch (err) {
    console.warn("[recycle-bin-cleanup] Cleanup failed (non-fatal):", err);
  }
}

/**
 * Cleans up stale e2e- projects (both active and in recycle bin) left over
 * from previous test runs. Called from global setup so dangling data is
 * removed even if the previous run's teardown failed.
 */
export async function cleanupStaleE2eProjects(
  request: APIRequestContext
): Promise<void> {
  const E2E_PREFIX = "e2e-";
  try {
    const { token, extraHeaders } = getAuthToken();
    const client = new GraphQLClient(request, token, extraHeaders);

    const { data: meData } = await client.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    const workspaceId = meData.me.myWorkspaceId;

    // Collect active e2e projects
    const { data: activeData } = await client.query<{
      projects: { nodes: { id: string; name: string }[] };
    }>(GET_PROJECTS, {
      workspaceId,
      pagination: { first: 500 },
      keyword: E2E_PREFIX
    });
    const activeProjects = activeData.projects.nodes.filter((p) =>
      p.name.startsWith(E2E_PREFIX)
    );

    // Collect soft-deleted e2e projects from recycle bin
    const FETCH_DELETED_E2E = `
      query($workspaceId: ID!, $pagination: Pagination) {
        deletedProjects(workspaceId: $workspaceId, pagination: $pagination) {
          totalCount
          pageInfo { hasNextPage endCursor }
          nodes { id name }
        }
      }
    `;
    type E2EDeletedPage = {
      deletedProjects: {
        totalCount: number;
        nodes: { id: string; name: string }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
    const emptyE2EPage: E2EDeletedPage = {
      deletedProjects: {
        totalCount: 0,
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    };

    const deletedE2eProjects: { id: string; name: string }[] = [];
    let cursor: string | null = null;
    let hasMore = true;
    while (hasMore) {
      const result = await client
        .query<E2EDeletedPage>(FETCH_DELETED_E2E, {
          workspaceId,
          pagination: { first: 1, ...(cursor ? { after: cursor } : {}) }
        })
        .catch(() => ({ data: emptyE2EPage }));
      const data: E2EDeletedPage = result.data;
      const matched = data.deletedProjects.nodes.filter((p) =>
        p.name.startsWith(E2E_PREFIX)
      );
      deletedE2eProjects.push(...matched);
      hasMore = data.deletedProjects.pageInfo?.hasNextPage ?? false;
      cursor = data.deletedProjects.pageInfo?.endCursor ?? null;
      if (!hasMore || !cursor) break;
    }

    const all = [...activeProjects, ...deletedE2eProjects];
    console.log(
      `[e2e-cleanup] Found ${activeProjects.length} active and ${deletedE2eProjects.length} deleted stale e2e project(s).`
    );

    if (all.length === 0) return;

    let deleted = 0;
    for (const project of all) {
      await client
        .mutate(UPDATE_PROJECT, {
          input: { projectId: project.id, deleted: true }
        })
        .catch(() => {});
      await client
        .mutate(DELETE_PROJECT, { input: { projectId: project.id } })
        .then(() => {
          deleted++;
        })
        .catch((err) =>
          console.warn(`[e2e-cleanup] Failed to delete "${project.name}":`, err)
        );
    }

    console.log(
      `[e2e-cleanup] Deleted ${deleted}/${all.length} stale e2e project(s).`
    );
  } catch (err) {
    console.warn("[e2e-cleanup] Cleanup failed (non-fatal):", err);
  }
}

/**
 * Extracts the browser's Auth0 token from storage state and derives the
 * GraphQL endpoint from the JWT audience. Used to clean the recycle bin in
 * environments that differ from the dev API (e.g. OSS Cloud Run PR previews).
 */
function getBrowserEnvToken(
  storagePath: string
): { token: string } | null {
  try {
    const state = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
    for (const origin of state.origins ?? []) {
      for (const item of origin.localStorage ?? []) {
        if (!item.name.startsWith("@@auth0spajs@@") || !item.value) continue;
        const parsed = JSON.parse(item.value);
        const token = parsed?.body?.access_token;
        if (token) return { token };
      }
    }
  } catch {
    // malformed, fall through
  }
  return null;
}

/**
 * Cleans up the recycle bin in the browser's auth environment.
 * This handles cases where the browser logged into a different environment
 * than the dev API (e.g. OSS Cloud Run PR previews use api.test.reearth.dev).
 */
export async function cleanupBrowserEnvRecycleBin(
  request: APIRequestContext,
  userStoragePath: string
): Promise<void> {
  const baseUrl = process.env.REEARTH_WEB_E2E_BASEURL ?? "";
  if (!baseUrl.includes(".run.app")) return;

  const browserEnv = getBrowserEnvToken(userStoragePath);
  if (!browserEnv) return;

  // Fetch the actual API URL from the frontend's runtime config
  let graphqlEndpoint: string;
  try {
    const configRes = await request.get(`${baseUrl}/reearth_config.json`);
    const config = await configRes.json();
    const apiUrl = (config?.api ?? config?.api_url)?.replace(/\/$/, "");
    if (!apiUrl) {
      console.warn("[oss-cleanup] Could not read api_url from reearth_config.json");
      return;
    }
    graphqlEndpoint = `${apiUrl}/graphql`;
  } catch (err) {
    console.warn("[oss-cleanup] Failed to fetch reearth_config.json:", err);
    return;
  }

  try {
    const { token } = browserEnv;
    console.log(`[oss-cleanup] Cleaning recycle bin at ${graphqlEndpoint}`);
    const client = new GraphQLClient(request, token, {}, graphqlEndpoint);

    const { data: meData } = await client.query<{
      me: { id: string; myWorkspaceId: string };
    }>(GET_ME);
    const { id: userId, myWorkspaceId: workspaceId } = meData.me;
    console.log(`[oss-cleanup] userId=${userId} workspaceId=${workspaceId}`);

    const BATCH_SIZE = 10;
    let cursor: string | null = null;
    let hasMore = true;
    let deleted = 0;
    const toDelete: { id: string; name: string }[] = [];

    // Collect up to BATCH_SIZE e2e projects — stop early to avoid deep pagination
    while (hasMore && toDelete.length < BATCH_SIZE) {
      const { data } = await client.query<{
        deletedProjects: {
          totalCount: number;
          nodes: { id: string; name: string }[];
          pageInfo: { hasNextPage: boolean; endCursor: string };
        };
      }>(GET_DELETED_PROJECTS, {
        workspaceId,
        pagination: { first: 50, ...(cursor ? { after: cursor } : {}) }
      });

      const e2eProjects = data.deletedProjects.nodes.filter(p =>
        p.name.startsWith("e2e-")
      );
      console.log(`[oss-cleanup] totalCount=${data.deletedProjects.totalCount} e2e=${e2eProjects.length} this page`);
      toDelete.push(...e2eProjects.slice(0, BATCH_SIZE - toDelete.length));

      hasMore = data.deletedProjects.pageInfo?.hasNextPage ?? false;
      cursor = data.deletedProjects.pageInfo?.endCursor ?? null;
      if (!hasMore || !cursor) break;
    }

    console.log(`[oss-cleanup] Attempting to delete ${toDelete.length} e2e project(s)`);
    for (const project of toDelete) {
      // Recover first (set deleted: false), then permanently delete
      await client
        .mutate(UPDATE_PROJECT, { input: { projectId: project.id, deleted: false } })
        .catch(() => {});
      await client
        .mutate(DELETE_PROJECT, { input: { projectId: project.id } })
        .then(() => deleted++)
        .catch(() => {});
    }

    console.log(`[oss-cleanup] Deleted ${deleted}/${toDelete.length} e2e project(s) from recycle bin.`);
  } catch (err) {
    console.warn("[oss-cleanup] Cleanup failed (non-fatal):", err);
  }
}
