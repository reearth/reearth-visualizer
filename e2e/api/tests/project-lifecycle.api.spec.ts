import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import { CREATE_PROJECT, CREATE_SCENE, UPDATE_PROJECT, DELETE_PROJECT } from "../graphql/mutations";
import { GET_ME, GET_PROJECT, GET_PROJECTS } from "../graphql/queries";

const projectName = faker.lorem.words(2);
const projectAlias = faker.string.alphanumeric(15);

test.describe.configure({ mode: "serial" });

test.describe("Project CRUD lifecycle via API", () => {
  let workspaceId: string;
  let projectId: string;

  test("Verify auth and get workspace", async ({ gqlClient }) => {
    const data = await gqlClient.query<{
      me: { id: string; email: string; myWorkspaceId: string };
    }>(GET_ME);

    expect(data.me.id).toBeTruthy();
    workspaceId = data.me.myWorkspaceId;
  });

  test("Create a new project", async ({ gqlClient }) => {
    const data = await gqlClient.mutate<{
      createProject: { project: { id: string; name: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: projectName,
        projectAlias,
        description: "API test project",
        coreSupport: true
      }
    });

    expect(data.createProject.project.name).toBe(projectName);
    projectId = data.createProject.project.id;
  });

  test("Attach a scene to the project", async ({ gqlClient }) => {
    const data = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    expect(data.createScene.scene.id).toBeTruthy();
  });

  test("Read back the created project", async ({ gqlClient }) => {
    const data = await gqlClient.query<{
      node: { id: string; name: string; description: string };
    }>(GET_PROJECT, { projectId });

    expect(data.node.id).toBe(projectId);
    expect(data.node.name).toBe(projectName);
    expect(data.node.description).toBe("API test project");
  });

  test("Verify project appears in workspace project list", async ({ gqlClient }) => {
    const data = await gqlClient.query<{
      projects: { totalCount: number; nodes: { id: string; name: string }[] };
    }>(GET_PROJECTS, { workspaceId, sort: { field: "CREATEDAT", direction: "DESC" }, pagination: { first: 20 } });

    expect(data.projects.totalCount).toBeGreaterThan(0);
    const match = data.projects.nodes.find(p => p.id === projectId);
    expect(match).toBeDefined();
  });

  test("Update project name and description", async ({ gqlClient }) => {
    const newName = `${projectName} updated`;
    const data = await gqlClient.mutate<{
      updateProject: { project: { name: string; description: string } };
    }>(UPDATE_PROJECT, {
      input: { projectId, name: newName, description: "Updated via API" }
    });

    expect(data.updateProject.project.name).toBe(newName);
    expect(data.updateProject.project.description).toBe("Updated via API");
  });

  test("Soft-delete the project", async ({ gqlClient }) => {
    const data = await gqlClient.mutate<{
      updateProject: { project: { isDeleted: boolean } };
    }>(UPDATE_PROJECT, { input: { projectId, deleted: true } });
    expect(data.updateProject.project.isDeleted).toBe(true);
  });

  test("Permanently delete the project", async ({ gqlClient }) => {
    const data = await gqlClient.mutate<{
      deleteProject: { projectId: string };
    }>(DELETE_PROJECT, { input: { projectId } });
    expect(data.deleteProject.projectId).toBe(projectId);
  });

  test("Verify project is gone from workspace", async ({ gqlClient }) => {
    const data = await gqlClient.query<{
      projects: { nodes: { id: string }[] };
    }>(GET_PROJECTS, { workspaceId, sort: { field: "CREATEDAT", direction: "DESC" }, pagination: { first: 20 } });

    expect(data.projects.nodes.find(p => p.id === projectId)).toBeUndefined();
  });
});
