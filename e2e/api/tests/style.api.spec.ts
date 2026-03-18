import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import {
  ADD_STYLE,
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  DUPLICATE_STYLE,
  REMOVE_STYLE,
  UPDATE_STYLE
} from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

test.describe.configure({ mode: "serial" });

test.describe("Style CRUD lifecycle via API", () => {
  let projectId: string;
  let sceneId: string;
  let styleId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project and scene", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: `Style Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;
  });

  test("Add a style to the scene", async ({ gqlClient }) => {
    const styleName = `Style ${faker.string.alphanumeric(6)}`;
    const styleValue = {
      type: "ExampleType",
      url: "https://example.com/data",
      value: "sampleValue"
    };

    const { status, data } = await gqlClient.mutate<{
      addStyle: { style: { id: string; sceneId: string; name: string; value: unknown } };
    }>(ADD_STYLE, {
      input: { sceneId, name: styleName, value: styleValue }
    });

    expect(status).toBe(200);
    expect(data.addStyle.style.id).toBeTruthy();
    expect(data.addStyle.style.sceneId).toBe(sceneId);
    expect(data.addStyle.style.name).toBe(styleName);
    styleId = data.addStyle.style.id;
  });

  test("Update style name and value", async ({ gqlClient }) => {
    const newName = `Updated Style ${faker.string.alphanumeric(6)}`;
    const newValue = {
      type: "UpdatedType",
      url: "https://example.com/updated"
    };

    const { status, data } = await gqlClient.mutate<{
      updateStyle: { style: { id: string; name: string; value: unknown } };
    }>(UPDATE_STYLE, {
      input: { styleId, name: newName, value: newValue }
    });

    expect(status).toBe(200);
    expect(data.updateStyle.style.id).toBe(styleId);
    expect(data.updateStyle.style.name).toBe(newName);
  });

  test("Duplicate a style", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      duplicateStyle: {
        style: { id: string; sceneId: string; name: string; value: unknown };
      };
    }>(DUPLICATE_STYLE, { input: { styleId } });

    expect(status).toBe(200);
    const dup = data.duplicateStyle.style;
    expect(dup.id).toBeTruthy();
    expect(dup.id).not.toBe(styleId);
    expect(dup.sceneId).toBe(sceneId);

    // Clean up duplicated style
    await gqlClient.mutate(REMOVE_STYLE, { input: { styleId: dup.id } });
  });

  test("Remove a style", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeStyle: { styleId: string };
    }>(REMOVE_STYLE, { input: { styleId } });

    expect(status).toBe(200);
    expect(data.removeStyle.styleId).toBe(styleId);
  });
});

test.describe("Style negative scenarios", () => {
  test("Cannot add style to a non-existent scene", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    await expect(
      gqlClient.mutate(ADD_STYLE, {
        input: {
          sceneId: fakeSceneId,
          name: "Ghost Style",
          value: { type: "test" }
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent style", async ({ gqlClient }) => {
    const fakeStyleId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_STYLE, {
        input: { styleId: fakeStyleId, name: "Ghost" }
      })
    ).rejects.toThrow();
  });

  test("Cannot remove a non-existent style", async ({ gqlClient }) => {
    const fakeStyleId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_STYLE, { input: { styleId: fakeStyleId } })
    ).rejects.toThrow();
  });

  test("Cannot duplicate a non-existent style", async ({ gqlClient }) => {
    const fakeStyleId = generateFakeId();
    await expect(
      gqlClient.mutate(DUPLICATE_STYLE, { input: { styleId: fakeStyleId } })
    ).rejects.toThrow();
  });
});
