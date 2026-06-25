#!/usr/bin/env node
// Permanently deletes all projects in the recycle bin for a given workspace.
// Usage: node scripts/cleanup-recycle-bin.mjs

import * as dotenv from "dotenv";
import * as https from "https";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function deriveApiEndpoint(baseUrl) {
  try {
    const parsed = new URL(baseUrl);
    parsed.hostname = `api.${parsed.hostname}`;
    return `${parsed.origin}/api/graphql`;
  } catch {
    return `${baseUrl}/api/graphql`;
  }
}

const GRAPHQL_ENDPOINT = process.env.REEARTH_E2E_API_URL
  ? `${process.env.REEARTH_E2E_API_URL.replace(/\/$/, "")}/graphql`
  : deriveApiEndpoint(process.env.REEARTH_WEB_E2E_BASEURL || "http://localhost:3000");

const AUTH0_DOMAIN = process.env.REEARTH_E2E_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.REEARTH_E2E_AUTH0_CLIENT_ID;
const AUTH0_AUDIENCE = process.env.REEARTH_E2E_AUTH0_AUDIENCE;
const EMAIL = process.env.REEARTH_E2E_EMAIL;
const PASSWORD = process.env.REEARTH_E2E_PASSWORD;

async function getToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      grant_type: "password",
      username: EMAIL,
      password: PASSWORD,
      audience: AUTH0_AUDIENCE,
      client_id: AUTH0_CLIENT_ID,
      scope: "openid profile email",
    });
    const req = https.request(
      {
        hostname: AUTH0_DOMAIN,
        path: "/oauth/token",
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const json = JSON.parse(data);
          if (!json.access_token) reject(new Error(`Auth0 token request failed: ${data}`));
          else resolve(json.access_token);
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function gql(token, query, variables) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed (${res.status}): ${await res.text()}`);
  const body = await res.json();
  if (body.errors) console.error("GraphQL errors:", body.errors);
  return body.data;
}

const GET_ME = `query { me { myWorkspaceId } }`;

const GET_DELETED = `
  query GetDeletedProjects($workspaceId: ID!, $pagination: Pagination) {
    deletedProjects(workspaceId: $workspaceId, pagination: $pagination) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes { id name }
    }
  }
`;

const DELETE_PROJECT = `
  mutation DeleteProject($input: DeleteProjectInput!) {
    deleteProject(input: $input) { projectId }
  }
`;

async function fetchAllDeleted(token, workspaceId) {
  const projects = [];
  let cursor = null;

  do {
    const data = await gql(token, GET_DELETED, {
      workspaceId,
      pagination: { first: 50, ...(cursor ? { after: cursor } : {}) },
    });
    const page = data.deletedProjects;
    projects.push(...page.nodes);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    console.log(`Fetched ${projects.length}/${page.totalCount} deleted projects...`);
  } while (cursor);

  return projects;
}

async function main() {
  console.log(`Endpoint: ${GRAPHQL_ENDPOINT}`);
  console.log("Fetching Auth0 token...");
  const token = await getToken();

  const meData = await gql(token, GET_ME, {});
  const workspaceId = meData.me.myWorkspaceId;
  console.log(`Workspace: ${workspaceId}`);

  console.log("Fetching deleted projects...");
  const projects = await fetchAllDeleted(token, workspaceId);

  if (projects.length === 0) {
    console.log("No deleted projects found. Recycle bin is clean.");
    return;
  }

  console.log(`\nFound ${projects.length} deleted project(s). Permanently deleting...`);
  let deleted = 0;
  for (const project of projects) {
    try {
      await gql(token, DELETE_PROJECT, { input: { projectId: project.id } });
      console.log(`  ✓ ${project.name}`);
      deleted++;
    } catch (err) {
      console.error(`  ✗ ${project.name}: ${err.message}`);
    }
  }

  console.log(`\nDone. Permanently deleted ${deleted}/${projects.length} projects.`);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
