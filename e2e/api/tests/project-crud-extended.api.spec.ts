import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  EXPORT_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_METADATA
} from "../graphql/mutations";
import {
  CHECK_PROJECT_ALIAS,
  CHECK_SCENE_ALIAS,
  GET_DELETED_PROJECTS,
  GET_ME,
  GET_STARRED_PROJECTS
} from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

test.describe.configure({ mode: "serial" });

test.describe("Project alias checks via API", () => {
  let workspaceId: string;
  let projectId: string;
  const projectAlias = faker.string.alphanumeric(15).toLowerCase();

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project with alias", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string; alias: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: `Alias Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;
    const { data: updated } = await gqlClient.mutate<{
      updateProject: {
        project: { id: string; projectAlias: string };
      };
    }>(UPDATE_PROJECT, {
      input: { projectId, projectAlias }
    });
    expect(updated.updateProject.project.projectAlias).toBe(projectAlias);

    await gqlClient.mutate(CREATE_SCENE, { input: { projectId } });
  });

  test("checkProjectAlias: random alias is available", async ({
    gqlClient
  }) => {
    const randomAlias = faker.string.alphanumeric(20).toLowerCase();
    const { status, data } = await gqlClient.query<{
      checkProjectAlias: { alias: string; available: boolean };
    }>(CHECK_PROJECT_ALIAS, {
      alias: randomAlias,
      workspaceId
    });

    expect(status).toBe(200);
    expect(data.checkProjectAlias.alias).toBe(randomAlias);
    expect(data.checkProjectAlias.available).toBe(true);
  });

  test("checkProjectAlias: own alias is available for same project", async ({
    gqlClient
  }) => {
    const { status, data } = await gqlClient.query<{
      checkProjectAlias: { alias: string; available: boolean };
    }>(CHECK_PROJECT_ALIAS, {
      alias: projectAlias,
      workspaceId,
      projectId
    });

    expect(status).toBe(200);
    expect(data.checkProjectAlias.alias).toBe(projectAlias);
    expect(data.checkProjectAlias.available).toBe(true);
  });

  test("checkSceneAlias: random alias is available", async ({ gqlClient }) => {
    const randomAlias = faker.string.alphanumeric(20).toLowerCase();
    const { status, data } = await gqlClient.query<{
      checkSceneAlias: { alias: string; available: boolean };
    }>(CHECK_SCENE_ALIAS, { alias: randomAlias });

    expect(status).toBe(200);
    expect(data.checkSceneAlias.alias).toBe(randomAlias);
    expect(data.checkSceneAlias.available).toBe(true);
  });
});

test.describe("Project starred and deleted queries via API", () => {
  let workspaceId: string;
  let projectId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: `Star/Del Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;
  });

  test("Star a project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateProject: { project: { id: string; starred: boolean } };
    }>(UPDATE_PROJECT, { input: { projectId, starred: true } });

    expect(status).toBe(200);
    expect(data.updateProject.project.starred).toBe(true);
  });

  test("starredProjects returns the starred project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      starredProjects: {
        totalCount: number;
        nodes: { id: string; name: string; starred: boolean }[];
      };
    }>(GET_STARRED_PROJECTS, { workspaceId });

    expect(status).toBe(200);
    const found = data.starredProjects.nodes.find((p) => p.id === projectId);
    expect(found).toBeDefined();
    expect(found?.starred).toBe(true);
  });

  test("Unstar the project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateProject: { project: { id: string; starred: boolean } };
    }>(UPDATE_PROJECT, { input: { projectId, starred: false } });

    expect(status).toBe(200);
    expect(data.updateProject.project.starred).toBe(false);
  });

  test("starredProjects no longer includes the project", async ({
    gqlClient
  }) => {
    const { status, data } = await gqlClient.query<{
      starredProjects: {
        totalCount: number;
        nodes: { id: string }[];
      };
    }>(GET_STARRED_PROJECTS, { workspaceId });

    expect(status).toBe(200);
    const found = data.starredProjects.nodes.find((p) => p.id === projectId);
    expect(found).toBeUndefined();
  });

  test("Soft-delete the project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateProject: { project: { id: string; isDeleted: boolean } };
    }>(UPDATE_PROJECT, { input: { projectId, deleted: true } });

    expect(status).toBe(200);
    expect(data.updateProject.project.isDeleted).toBe(true);
  });

  test("deletedProjects returns the soft-deleted project", async ({
    gqlClient
  }) => {
    const { status, data } = await gqlClient.query<{
      deletedProjects: {
        totalCount: number;
        nodes: { id: string; name: string; isDeleted: boolean }[];
      };
    }>(GET_DELETED_PROJECTS, { workspaceId });

    expect(status).toBe(200);
    expect(data.deletedProjects.totalCount).toBeGreaterThan(0);
    const found = data.deletedProjects.nodes.find((p) => p.id === projectId);
    expect(found).toBeDefined();
    expect(found?.isDeleted).toBe(true);
  });
});

test.describe("Project export and metadata via API", () => {
  let workspaceId: string;
  let projectId: string;
  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project with scene", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = me.me.myWorkspaceId;

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: `Export Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    expect(sc.createScene.scene.id).toBeTruthy();
  });

  test("Export a project", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      exportProject: { projectDataPath: string };
    }>(EXPORT_PROJECT, { input: { projectId } });

    expect(status).toBe(200);
    expect(data.exportProject.projectDataPath).toBeTruthy();
  });

  test("Update project metadata", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateProjectMetadata: {
        metadata: {
          id: string;
          project: string;
          workspace: string;
          readme: string;
          license: string;
          topics: string[];
        };
      };
    }>(UPDATE_PROJECT_METADATA, {
      input: {
        project: projectId,
        readme: "# Test Project\nThis is a test.",
        license: "MIT",
        topics: ["test", "api", "automation"]
      }
    });

    expect(status).toBe(200);
    const meta = data.updateProjectMetadata.metadata;
    expect(meta.project).toBe(projectId);
    expect(meta.readme).toBe("# Test Project\nThis is a test.");
    expect(meta.license).toBe("MIT");
    expect(meta.topics).toEqual(["test", "api", "automation"]);
  });

  test("Update project metadata: clear fields", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateProjectMetadata: {
        metadata: {
          readme: string | null;
          license: string | null;
          topics: string[] | null;
        };
      };
    }>(UPDATE_PROJECT_METADATA, {
      input: {
        project: projectId,
        readme: "",
        license: "",
        topics: []
      }
    });

    expect(status).toBe(200);
    const meta = data.updateProjectMetadata.metadata;
    expect(meta.readme).toBeFalsy();
    expect(meta.license).toBeFalsy();
  });
});

test.describe("Project extended negative scenarios", () => {
  test("Cannot export a non-existent project", async ({ gqlClient }) => {
    const fakeProjectId = generateFakeId();
    await expect(
      gqlClient.mutate(EXPORT_PROJECT, { input: { projectId: fakeProjectId } })
    ).rejects.toThrow();
  });

  test("Cannot update metadata for a non-existent project", async ({
    gqlClient
  }) => {
    const fakeProjectId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_PROJECT_METADATA, {
        input: { project: fakeProjectId, readme: "test" }
      })
    ).rejects.toThrow();
  });
});
