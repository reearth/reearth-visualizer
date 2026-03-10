import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  UPDATE_PROPERTY_VALUE,
  REMOVE_PROPERTY_FIELD,
  UNLINK_PROPERTY_VALUE,
  ADD_PROPERTY_ITEM,
  MOVE_PROPERTY_ITEM,
  REMOVE_PROPERTY_ITEM,
  UPDATE_PROPERTY_ITEMS
} from "../graphql/mutations";
import { GET_ME, GET_SCENE } from "../graphql/queries";

type PropertyItem = {
  id: string;
  schemaGroupId: string;
  groups?: { id: string; schemaGroupId: string }[];
  fields?: { id: string; fieldId: string; type: string; value: unknown }[];
};

type SceneNode = {
  node: {
    id: string;
    projectId: string;
    property: {
      id: string;
      items: PropertyItem[];
    };
    stories: { id: string }[];
  } | null;
};

test.describe.configure({ mode: "serial" });

test.describe("Property operations via API", () => {
  let workspaceId: string;
  let projectId: string;
  let sceneId: string;
  let propertyId: string;
  let tilesGroupId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, {
        input: { projectId }
      });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create project with scene", async ({ gqlClient }) => {
    const { data: meData } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = meData.me.myWorkspaceId;

    const { data: projData } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: "Property Test Project",
        coreSupport: true
      }
    });
    projectId = projData.createProject.project.id;

    const { data: sceneData } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sceneData.createScene.scene.id;

    // Fetch scene to get property ID and tiles group ID
    const { data: scene } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    expect(scene.node).not.toBeNull();
    propertyId = scene.node!.property.id;

    // Find the tiles group list item
    const tilesItem = scene.node!.property.items.find(
      (i) => i.schemaGroupId === "tiles"
    );
    expect(tilesItem).toBeDefined();
    // tiles is a PropertyGroupList, get the first group
    if (tilesItem?.groups && tilesItem.groups.length > 0) {
      tilesGroupId = tilesItem.groups[0].id;
    }
  });

  test("UpdatePropertyValue: set tile_type on scene property", async ({
    gqlClient
  }) => {
    // If no group exists yet, add one
    if (!tilesGroupId) {
      const { data } = await gqlClient.mutate<{
        addPropertyItem: {
          property: { id: string; items: PropertyItem[] };
        };
      }>(ADD_PROPERTY_ITEM, {
        propertyId,
        schemaGroupId: "tiles"
      });
      const tilesItem = data.addPropertyItem.property.items.find(
        (i) => i.schemaGroupId === "tiles"
      );
      expect(tilesItem?.groups?.length).toBeGreaterThan(0);
      tilesGroupId = tilesItem!.groups![0].id;
    }

    const { status, data } = await gqlClient.mutate<{
      updatePropertyValue: {
        property: { id: string };
        propertyField: { type: string; value: unknown };
      };
    }>(UPDATE_PROPERTY_VALUE, {
      propertyId,
      schemaGroupId: "tiles",
      itemId: tilesGroupId,
      fieldId: "tile_type",
      value: "open_street_map",
      type: "STRING"
    });

    expect(status).toBe(200);
    expect(data.updatePropertyValue.property.id).toBe(propertyId);
    expect(data.updatePropertyValue.propertyField.value).toBe(
      "open_street_map"
    );
  });

  test("RemovePropertyField: remove tile_type field", async ({
    gqlClient
  }) => {
    const { status, data } = await gqlClient.mutate<{
      removePropertyField: { property: { id: string } };
    }>(REMOVE_PROPERTY_FIELD, {
      propertyId,
      schemaGroupId: "tiles",
      itemId: tilesGroupId,
      fieldId: "tile_type"
    });

    expect(status).toBe(200);
    expect(data.removePropertyField.property.id).toBe(propertyId);
  });

  test("UpdatePropertyValue and UnlinkPropertyValue: set then unlink", async ({
    gqlClient
  }) => {
    // Set a value first
    await gqlClient.mutate(UPDATE_PROPERTY_VALUE, {
      propertyId,
      schemaGroupId: "tiles",
      itemId: tilesGroupId,
      fieldId: "tile_type",
      value: "default",
      type: "STRING"
    });

    // Unlink the value
    const { status, data } = await gqlClient.mutate<{
      unlinkPropertyValue: { property: { id: string } };
    }>(UNLINK_PROPERTY_VALUE, {
      propertyId,
      schemaGroupId: "tiles",
      itemId: tilesGroupId,
      fieldId: "tile_type"
    });

    expect(status).toBe(200);
    expect(data.unlinkPropertyValue.property.id).toBe(propertyId);
  });

  test("AddPropertyItem: add new tile group", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      addPropertyItem: {
        property: { id: string; items: PropertyItem[] };
      };
    }>(ADD_PROPERTY_ITEM, {
      propertyId,
      schemaGroupId: "tiles"
    });

    expect(status).toBe(200);
    expect(data.addPropertyItem.property.id).toBe(propertyId);

    const tilesItem = data.addPropertyItem.property.items.find(
      (i) => i.schemaGroupId === "tiles"
    );
    expect(tilesItem).toBeDefined();
    expect(tilesItem!.groups!.length).toBeGreaterThanOrEqual(2);
  });

  test("MovePropertyItem: reorder tile groups", async ({ gqlClient }) => {
    // Get current state
    const { data: scene } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    const tilesItem = scene.node!.property.items.find(
      (i) => i.schemaGroupId === "tiles"
    );
    expect(tilesItem?.groups?.length).toBeGreaterThanOrEqual(2);
    const lastGroup = tilesItem!.groups![tilesItem!.groups!.length - 1];

    // Move last group to index 0
    const { status, data } = await gqlClient.mutate<{
      movePropertyItem: { property: { id: string } };
    }>(MOVE_PROPERTY_ITEM, {
      propertyId,
      schemaGroupId: "tiles",
      itemId: lastGroup.id,
      index: 0
    });

    expect(status).toBe(200);
    expect(data.movePropertyItem.property.id).toBe(propertyId);
  });

  test("RemovePropertyItem: remove a tile group", async ({ gqlClient }) => {
    // Get current state
    const { data: scene } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    const tilesItem = scene.node!.property.items.find(
      (i) => i.schemaGroupId === "tiles"
    );
    const groupCountBefore = tilesItem!.groups!.length;
    const lastGroup = tilesItem!.groups![groupCountBefore - 1];

    const { status, data } = await gqlClient.mutate<{
      removePropertyItem: { property: { id: string } };
    }>(REMOVE_PROPERTY_ITEM, {
      propertyId,
      schemaGroupId: "tiles",
      itemId: lastGroup.id
    });

    expect(status).toBe(200);
    expect(data.removePropertyItem.property.id).toBe(propertyId);

    // Verify count decreased
    const { data: sceneAfter } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    const tilesAfter = sceneAfter.node!.property.items.find(
      (i) => i.schemaGroupId === "tiles"
    );
    expect(tilesAfter!.groups!.length).toBe(groupCountBefore - 1);
  });

  test("UpdatePropertyItems: batch add operations", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updatePropertyItems: { property: { id: string } };
    }>(UPDATE_PROPERTY_ITEMS, {
      propertyId,
      schemaGroupId: "tiles",
      operations: [
        { operation: "ADD", nameFieldValue: "batch1", nameFieldType: "STRING" },
        { operation: "ADD", nameFieldValue: "batch2", nameFieldType: "STRING" }
      ]
    });

    expect(status).toBe(200);
    expect(data.updatePropertyItems.property.id).toBe(propertyId);
  });
});
