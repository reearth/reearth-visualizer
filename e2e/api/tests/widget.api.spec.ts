import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import {
  ADD_WIDGET,
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  REMOVE_WIDGET,
  UPDATE_WIDGET,
  UPDATE_WIDGET_ALIGN_SYSTEM
} from "../graphql/mutations";
import { GET_ME, GET_SCENE_WIDGETS } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

test.describe.configure({ mode: "serial" });

test.describe("Widget CRUD lifecycle via API", () => {
  let projectId: string;
  let sceneId: string;
  let widgetId: string;

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
        name: `Widget Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;
  });

  test("Add a widget to the scene", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      addWidget: {
        scene: { id: string; widgets: { id: string; pluginId: string; extensionId: string }[] };
        sceneWidget: {
          id: string;
          pluginId: string;
          extensionId: string;
          enabled: boolean;
          extended: boolean;
          propertyId: string;
        };
      };
    }>(ADD_WIDGET, {
      input: {
        type: "DESKTOP",
        sceneId,
        pluginId: "reearth",
        extensionId: "button"
      }
    });

    expect(status).toBe(200);
    const widget = data.addWidget.sceneWidget;
    expect(widget.id).toBeTruthy();
    expect(widget.pluginId).toBe("reearth");
    expect(widget.extensionId).toBe("button");
    widgetId = widget.id;
  });

  test("Verify widget appears in scene", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      node: {
        id: string;
        widgets: { id: string; pluginId: string; extensionId: string }[];
      };
    }>(GET_SCENE_WIDGETS, { sceneId });

    expect(status).toBe(200);
    const found = data.node.widgets.find((w) => w.id === widgetId);
    expect(found).toBeDefined();
    expect(found?.pluginId).toBe("reearth");
    expect(found?.extensionId).toBe("button");
  });

  test("Update widget: enable and set location", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateWidget: {
        scene: { id: string };
        sceneWidget: { id: string; enabled: boolean; extended: boolean };
      };
    }>(UPDATE_WIDGET, {
      input: {
        type: "DESKTOP",
        sceneId,
        widgetId,
        enabled: true,
        location: { zone: "INNER", section: "LEFT", area: "TOP" },
        extended: false
      }
    });

    expect(status).toBe(200);
    expect(data.updateWidget.sceneWidget.id).toBe(widgetId);
    expect(data.updateWidget.sceneWidget.enabled).toBe(true);
  });

  test("Update widget align system", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateWidgetAlignSystem: { scene: { id: string } };
    }>(UPDATE_WIDGET_ALIGN_SYSTEM, {
      input: {
        type: "DESKTOP",
        sceneId,
        location: { zone: "INNER", section: "LEFT", area: "TOP" },
        align: "CENTERED",
        padding: { top: 10, bottom: 10, left: 10, right: 10 },
        gap: 5,
        centered: true
      }
    });

    expect(status).toBe(200);
    expect(data.updateWidgetAlignSystem.scene.id).toBe(sceneId);
  });

  test("Remove a widget", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeWidget: {
        scene: { id: string; widgets: { id: string }[] };
        widgetId: string;
      };
    }>(REMOVE_WIDGET, {
      input: { type: "DESKTOP", sceneId, widgetId }
    });

    expect(status).toBe(200);
    expect(data.removeWidget.widgetId).toBe(widgetId);
    const remaining = data.removeWidget.scene.widgets;
    expect(remaining.find((w) => w.id === widgetId)).toBeUndefined();
  });
});

test.describe("Widget negative scenarios", () => {
  test("Cannot add widget to a non-existent scene", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    await expect(
      gqlClient.mutate(ADD_WIDGET, {
        input: {
          type: "DESKTOP",
          sceneId: fakeSceneId,
          pluginId: "reearth",
          extensionId: "button"
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent widget", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    const fakeWidgetId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_WIDGET, {
        input: {
          type: "DESKTOP",
          sceneId: fakeSceneId,
          widgetId: fakeWidgetId,
          enabled: true
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot remove a non-existent widget", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    const fakeWidgetId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_WIDGET, {
        input: {
          type: "DESKTOP",
          sceneId: fakeSceneId,
          widgetId: fakeWidgetId
        }
      })
    ).rejects.toThrow();
  });
});
