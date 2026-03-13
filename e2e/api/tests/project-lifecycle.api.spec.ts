import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import { CREATE_PROJECT, CREATE_SCENE, UPDATE_PROJECT, DELETE_PROJECT } from "../graphql/mutations";
import { GET_ME, GET_PROJECT, GET_PROJECTS } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

const projectName = faker.lorem.words(2);
const projectAlias = faker.string.alphanumeric(15);

test.describe.configure({ mode: "serial" });

test.describe("Project CRUD lifecycle via API", () => {
  let workspaceId: string;
  let projectId: string;

  test("Verify auth and get workspace", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      me: { id: string; email: string; myWorkspaceId: string };
    }>(GET_ME);

    expect(status).toBe(200);
    expect(data.me.id).toBeTruthy();
    workspaceId = data.me.myWorkspaceId;
  });

  test("Create a new project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
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

    expect(status).toBe(200);
    expect(data.createProject.project.name).toBe(projectName);
    projectId = data.createProject.project.id;
  });

  test("Attach a scene to the project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });

    expect(status).toBe(200);
    expect(data.createScene.scene.id).toBeTruthy();
  });

  test("Read back the created project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      node: { id: string; name: string; description: string };
    }>(GET_PROJECT, { projectId });

    expect(status).toBe(200);
    expect(data.node.id).toBe(projectId);
    expect(data.node.name).toBe(projectName);
    expect(data.node.description).toBe("API test project");
  });

  test("Verify project appears in workspace project list", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      projects: { totalCount: number; nodes: { id: string; name: string }[] };
    }>(GET_PROJECTS, { workspaceId, sort: { field: "CREATEDAT", direction: "DESC" }, pagination: { first: 20 } });

    expect(status).toBe(200);
    expect(data.projects.totalCount).toBeGreaterThan(0);
    const match = data.projects.nodes.find(p => p.id === projectId);
    expect(match).toBeDefined();
  });

  test("Update project name and description", async ({ gqlClient }) => {
    const newName = `${projectName} updated`;
    const { status, data } = await gqlClient.mutate<{
      updateProject: { project: { name: string; description: string } };
    }>(UPDATE_PROJECT, {
      input: { projectId, name: newName, description: "Updated via API" }
    });

    expect(status).toBe(200);
    expect(data.updateProject.project.name).toBe(newName);
    expect(data.updateProject.project.description).toBe("Updated via API");
  });

  test("Soft-delete the project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateProject: { project: { isDeleted: boolean } };
    }>(UPDATE_PROJECT, { input: { projectId, deleted: true } });

    expect(status).toBe(200);
    expect(data.updateProject.project.isDeleted).toBe(true);
  });

  test("Permanently delete the project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      deleteProject: { projectId: string };
    }>(DELETE_PROJECT, { input: { projectId } });

    expect(status).toBe(200);
    expect(data.deleteProject.projectId).toBe(projectId);
  });

  test("Verify project is gone", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      node: { id: string } | null;
    }>(GET_PROJECT, { projectId });

    expect(status).toBe(200);
    expect(data.node).toBeNull();
  });
});

test.describe("Project negative scenarios via API", () => {
  test("Cannot create project in a non-existent workspace", async ({
    gqlClient
  }) => {
    const fakeWsId = generateFakeId();
    await expect(
      gqlClient.mutate(CREATE_PROJECT, {
        input: {
          workspaceId: fakeWsId,
          visualizer: "CESIUM",
          name: "Ghost Project",
          coreSupport: true
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent project", async ({ gqlClient }) => {
    const fakeProjectId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_PROJECT, {
        input: { projectId: fakeProjectId, name: "No Such Project" }
      })
    ).rejects.toThrow();
  });

  test("Cannot delete a non-existent project", async ({ gqlClient }) => {
    const fakeProjectId = generateFakeId();
    await expect(
      gqlClient.mutate(DELETE_PROJECT, {
        input: { projectId: fakeProjectId }
      })
    ).rejects.toThrow();
  });

  test("Read non-existent project returns null", async ({ gqlClient }) => {
    const fakeProjectId = generateFakeId();
    const { status, data } = await gqlClient.query<{
      node: { id: string } | null;
    }>(GET_PROJECT, { projectId: fakeProjectId });

    expect(status).toBe(200);
    expect(data.node).toBeNull();
  });

  test("Cannot attach a scene to a non-existent project", async ({
    gqlClient
  }) => {
    const fakeProjectId = generateFakeId();
    await expect(
      gqlClient.mutate(CREATE_SCENE, { input: { projectId: fakeProjectId } })
    ).rejects.toThrow();
  });

  test("Cannot soft-delete a non-existent project", async ({ gqlClient }) => {
    const fakeProjectId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_PROJECT, {
        input: { projectId: fakeProjectId, deleted: true }
      })
    ).rejects.toThrow();
  });
});
