import fs from "fs";
import path from "path";

import { APIRequestContext } from "@playwright/test";

import { GraphQLClient } from "../api/graphql/client";
import { DELETE_PROJECT, UPDATE_PROJECT } from "../api/graphql/mutations";
import { GET_ME, GET_PROJECTS } from "../api/graphql/queries";

const apiTokenPath = path.join(__dirname, "../.auth/api-token.json");
const storagePath = path.join(__dirname, "../.auth/user.json");

/**
 * Try to obtain an auth token from either the API token file or the
 * browser storage state (Auth0 access_token). This ensures cleanup works
 * regardless of which Playwright project (webkit / api-tests) ran first.
 */
function getAuthToken(): { token: string; extraHeaders: Record<string, string> } {
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

    // Find the project by name
    const { data: projectsData } = await client.query<{
      projects: { nodes: { id: string; name: string }[] };
    }>(GET_PROJECTS, {
      workspaceId,
      pagination: { first: 100 },
      keyword: projectName
    });

    const projects = projectsData.projects.nodes.filter(
      (p) => p.name === projectName
    );

    if (projects.length === 0) {
      console.log(
        `[cleanup] Project "${projectName}" not found — may have been deleted already.`
      );
      return;
    }

    for (const project of projects) {
      // Soft delete (move to recycle bin)
      await client
        .mutate(UPDATE_PROJECT, {
          input: { projectId: project.id, deleted: true }
        })
        .catch((err) => {
          console.warn(
            `[cleanup] Failed to soft-delete project "${projectName}" (${project.id}):`,
            err
          );
        });

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
      `[cleanup] Deleted ${projects.length} project(s) named "${projectName}".`
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
