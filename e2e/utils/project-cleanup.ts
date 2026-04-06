import fs from "fs";
import path from "path";

import { APIRequestContext } from "@playwright/test";

import { GraphQLClient } from "../api/graphql/client";
import { DELETE_PROJECT, UPDATE_PROJECT } from "../api/graphql/mutations";
import { GET_ME, GET_PROJECTS } from "../api/graphql/queries";

const tokenPath = path.join(__dirname, "../.auth/api-token.json");

function getGqlClient(request: APIRequestContext): GraphQLClient {
  const { token, extraHeaders } = JSON.parse(
    fs.readFileSync(tokenPath, "utf-8")
  );
  return new GraphQLClient(request, token, extraHeaders);
}

/**
 * Delete a project by name via the GraphQL API.
 * Performs soft-delete (move to recycle bin) then permanent delete.
 * Silently ignores errors if the project doesn't exist or was already deleted.
 */
export async function deleteProjectByName(
  request: APIRequestContext,
  projectName: string
): Promise<void> {
  try {
    const client = getGqlClient(request);

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

    for (const project of projects) {
      // Soft delete (move to recycle bin)
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
        .catch(() => {});
    }
  } catch {
    // Silently ignore cleanup errors — don't fail the test suite
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
