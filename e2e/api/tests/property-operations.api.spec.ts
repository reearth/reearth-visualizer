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

import { generateFakeId } from "./test-helpers";

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

/** Finds the tiles PropertyGroupList from a scene's property items. */
function findTilesItem(items: PropertyItem[]): PropertyItem {
  const item = items.find((i) => i.schemaGroupId === "tiles");
  if (!item) throw new Error("tiles schema group not found");
  return item;
}

/** Returns the groups array from a tiles item, throwing if missing. */
function getTilesGroups(
  item: PropertyItem
): { id: string; schemaGroupId: string }[] {
  const groups = item.groups;
  if (!groups || groups.length === 0)
    throw new Error("tiles item has no groups");
  return groups;
}

/** Extracts the scene node, throwing if null. */
function extractSceneNode(data: SceneNode) {
  const node = data.node;
  if (!node) throw new Error("scene node is null");
  return node;
}

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
    const sceneNode = extractSceneNode(scene);
    propertyId = sceneNode.property.id;

    const tilesItem = findTilesItem(sceneNode.property.items);
    if (tilesItem.groups && tilesItem.groups.length > 0) {
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
      const tilesItem = findTilesItem(data.addPropertyItem.property.items);
      const groups = getTilesGroups(tilesItem);
      tilesGroupId = groups[0].id;
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

    const tilesItem = findTilesItem(data.addPropertyItem.property.items);
    const groups = getTilesGroups(tilesItem);
    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  test("MovePropertyItem: reorder tile groups", async ({ gqlClient }) => {
    const { data: scene } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    const sceneNode = extractSceneNode(scene);
    const tilesItem = findTilesItem(sceneNode.property.items);
    const groups = getTilesGroups(tilesItem);
    expect(groups.length).toBeGreaterThanOrEqual(2);
    const lastGroup = groups[groups.length - 1];

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
    const { data: scene } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    const sceneNode = extractSceneNode(scene);
    const tilesItem = findTilesItem(sceneNode.property.items);
    const groups = getTilesGroups(tilesItem);
    const groupCountBefore = groups.length;
    const lastGroup = groups[groupCountBefore - 1];

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
    const afterNode = extractSceneNode(sceneAfter);
    const tilesAfter = findTilesItem(afterNode.property.items);
    const afterGroups = getTilesGroups(tilesAfter);
    expect(afterGroups.length).toBe(groupCountBefore - 1);
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

test.describe("Property negative scenarios via API", () => {
  test("Cannot update property value on a non-existent property", async ({
    gqlClient
  }) => {
    const fakePropertyId = generateFakeId();
    const fakeItemId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_PROPERTY_VALUE, {
        propertyId: fakePropertyId,
        schemaGroupId: "tiles",
        itemId: fakeItemId,
        fieldId: "tile_type",
        value: "default",
        type: "STRING"
      })
    ).rejects.toThrow();
  });

  test("Cannot remove field from a non-existent property", async ({
    gqlClient
  }) => {
    const fakePropertyId = generateFakeId();
    const fakeItemId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_PROPERTY_FIELD, {
        propertyId: fakePropertyId,
        schemaGroupId: "tiles",
        itemId: fakeItemId,
        fieldId: "tile_type"
      })
    ).rejects.toThrow();
  });

  test("Cannot add property item to a non-existent property", async ({
    gqlClient
  }) => {
    const fakePropertyId = generateFakeId();
    await expect(
      gqlClient.mutate(ADD_PROPERTY_ITEM, {
        propertyId: fakePropertyId,
        schemaGroupId: "tiles"
      })
    ).rejects.toThrow();
  });

  test("Cannot remove a non-existent property item", async ({
    gqlClient
  }) => {
    const fakePropertyId = generateFakeId();
    const fakeItemId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_PROPERTY_ITEM, {
        propertyId: fakePropertyId,
        schemaGroupId: "tiles",
        itemId: fakeItemId
      })
    ).rejects.toThrow();
  });

  test("Cannot move a non-existent property item", async ({ gqlClient }) => {
    const fakePropertyId = generateFakeId();
    const fakeItemId = generateFakeId();
    await expect(
      gqlClient.mutate(MOVE_PROPERTY_ITEM, {
        propertyId: fakePropertyId,
        schemaGroupId: "tiles",
        itemId: fakeItemId,
        index: 0
      })
    ).rejects.toThrow();
  });
});
