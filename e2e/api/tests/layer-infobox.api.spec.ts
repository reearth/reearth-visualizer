import { test, expect } from "../fixtures/api-test-fixtures";
import {
  ADD_NLS_INFOBOX_BLOCK,
  ADD_NLS_LAYER_SIMPLE,
  CHANGE_CUSTOM_PROPERTY_TITLE,
  CREATE_NLS_INFOBOX,
  CREATE_NLS_PHOTO_OVERLAY,
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  DUPLICATE_NLS_LAYER,
  MOVE_NLS_INFOBOX_BLOCK,
  REMOVE_CUSTOM_PROPERTY,
  REMOVE_NLS_INFOBOX,
  REMOVE_NLS_INFOBOX_BLOCK,
  REMOVE_NLS_LAYER,
  REMOVE_NLS_PHOTO_OVERLAY,
  UPDATE_CUSTOM_PROPERTIES,
  UPDATE_NLS_LAYER,
  UPDATE_NLS_LAYERS
} from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

type LayerResult = {
  id: string;
  layerType: string;
  title: string;
  visible: boolean;
  sceneId: string;
  config: unknown;
  infobox: { id: string } | null;
};

type InfoboxBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
};

test.describe.configure({ mode: "serial" });
test.describe("Layer and infobox operations via API", () => {
  let projectId: string;
  let sceneId: string;
  let layerId: string;
  let duplicatedLayerId: string;
  const blockIds: string[] = [];

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project, scene, and layer", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Layer Test Project",
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;

    const { status, data } = await gqlClient.mutate<{
      addNLSLayerSimple: { layers: LayerResult };
    }>(ADD_NLS_LAYER_SIMPLE, {
      input: {
        sceneId,
        layerType: "simple",
        title: "Test Layer",
        visible: true,
        config: { data: { type: "geojson" } }
      }
    });

    expect(status).toBe(200);
    const layer = data.addNLSLayerSimple.layers;
    expect(layer.id).toBeTruthy();
    expect(layer.title).toBe("Test Layer");
    expect(layer.visible).toBe(true);
    layerId = layer.id;
  });

  test("Update layer name and visibility", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateNLSLayer: {
        layer: { id: string; title: string; visible: boolean };
      };
    }>(UPDATE_NLS_LAYER, {
      input: { layerId, name: "Renamed Layer", visible: false }
    });

    expect(status).toBe(200);
    expect(data.updateNLSLayer.layer.title).toBe("Renamed Layer");
    expect(data.updateNLSLayer.layer.visible).toBe(false);
  });

  test("Batch update layer via updateNLSLayers", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateNLSLayers: {
        layers: { id: string; title: string; visible: boolean }[];
      };
    }>(UPDATE_NLS_LAYERS, {
      input: {
        layers: [{ layerId, name: "Batch Updated", visible: true }]
      }
    });

    expect(status).toBe(200);
    expect(data.updateNLSLayers.layers.length).toBeGreaterThanOrEqual(1);
    const updated = data.updateNLSLayers.layers.find((l) => l.id === layerId);
    expect(updated?.title).toBe("Batch Updated");
  });

  test("Duplicate a layer", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      duplicateNLSLayer: { layer: { id: string; title: string } };
    }>(DUPLICATE_NLS_LAYER, { input: { layerId } });

    expect(status).toBe(200);
    expect(data.duplicateNLSLayer.layer.id).toBeTruthy();
    expect(data.duplicateNLSLayer.layer.id).not.toBe(layerId);
    duplicatedLayerId = data.duplicateNLSLayer.layer.id;
  });

  test("Remove the duplicated layer", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeNLSLayer: { layerId: string };
    }>(REMOVE_NLS_LAYER, { input: { layerId: duplicatedLayerId } });

    expect(status).toBe(200);
    expect(data.removeNLSLayer.layerId).toBe(duplicatedLayerId);
  });

  // ── Infobox

  test("Create an infobox on the layer", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      createNLSInfobox: {
        layer: {
          id: string;
          infobox: { id: string; sceneId: string; layerId: string };
        };
      };
    }>(CREATE_NLS_INFOBOX, { input: { layerId } });

    expect(status).toBe(200);
    expect(data.createNLSInfobox.layer.infobox).not.toBeNull();
    expect(data.createNLSInfobox.layer.infobox.layerId).toBe(layerId);
  });

  test("Add a text block to the infobox", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      addNLSInfoboxBlock: {
        infoboxBlock: InfoboxBlock;
        layer: { id: string; infobox: { blocks: InfoboxBlock[] } };
      };
    }>(ADD_NLS_INFOBOX_BLOCK, {
      input: {
        layerId,
        pluginId: "reearth",
        extensionId: "textInfoboxBetaBlock"
      }
    });

    expect(status).toBe(200);
    const newBlock = data.addNLSInfoboxBlock.infoboxBlock;
    expect(newBlock.id).toBeTruthy();
    blockIds.push(newBlock.id);
  });

  test("Add a second block for reordering", async ({ gqlClient }) => {
    const { data } = await gqlClient.mutate<{
      addNLSInfoboxBlock: {
        infoboxBlock: InfoboxBlock;
        layer: { id: string; infobox: { blocks: InfoboxBlock[] } };
      };
    }>(ADD_NLS_INFOBOX_BLOCK, {
      input: {
        layerId,
        pluginId: "reearth",
        extensionId: "imageInfoboxBetaBlock"
      }
    });

    const blocks = data.addNLSInfoboxBlock.layer.infobox.blocks;
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const newBlock = data.addNLSInfoboxBlock.infoboxBlock;
    expect(newBlock.id).toBeTruthy();
    blockIds.push(newBlock.id);
  });

  test("Move an infobox block to a new position", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      moveNLSInfoboxBlock: {
        layer: { id: string; infobox: { blocks: InfoboxBlock[] } };
      };
    }>(MOVE_NLS_INFOBOX_BLOCK, {
      input: { layerId, infoboxBlockId: blockIds[1], index: 0 }
    });

    expect(status).toBe(200);
    const blocks = data.moveNLSInfoboxBlock.layer.infobox.blocks;
    expect(blocks[0].id).toBe(blockIds[1]);
  });

  test("Remove an infobox block", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeNLSInfoboxBlock: {
        layer: { id: string; infobox: { blocks: InfoboxBlock[] } };
      };
    }>(REMOVE_NLS_INFOBOX_BLOCK, {
      input: { layerId, infoboxBlockId: blockIds[0] }
    });

    expect(status).toBe(200);
    const remaining = data.removeNLSInfoboxBlock.layer.infobox.blocks;
    const removed = remaining.find((b) => b.id === blockIds[0]);
    expect(removed).toBeUndefined();
  });

  test("Remove the infobox from the layer", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeNLSInfobox: { layer: { id: string; infobox: null } };
    }>(REMOVE_NLS_INFOBOX, { input: { layerId } });

    expect(status).toBe(200);
    expect(data.removeNLSInfobox.layer.infobox).toBeNull();
  });

  // ── Photo overlay

  test("Create a photo overlay on the layer", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      createNLSPhotoOverlay: {
        layer: {
          id: string;
          photoOverlay: { id: string; sceneId: string; layerId: string };
        };
      };
    }>(CREATE_NLS_PHOTO_OVERLAY, { input: { layerId } });

    expect(status).toBe(200);
    expect(data.createNLSPhotoOverlay.layer.photoOverlay).not.toBeNull();
    expect(data.createNLSPhotoOverlay.layer.photoOverlay.layerId).toBe(layerId);
  });

  test("Remove the photo overlay", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeNLSPhotoOverlay: { layer: { id: string; photoOverlay: null } };
    }>(REMOVE_NLS_PHOTO_OVERLAY, { input: { layerId } });

    expect(status).toBe(200);
    expect(data.removeNLSPhotoOverlay.layer.photoOverlay).toBeNull();
  });

  // ── Custom properties

  test("Set custom property schema on the layer", async ({ gqlClient }) => {
    const schema = { color: { type: "string" }, height: { type: "number" } };
    const { status, data } = await gqlClient.mutate<{
      updateCustomProperties: { layer: { id: string } };
    }>(UPDATE_CUSTOM_PROPERTIES, { input: { layerId, schema } });

    expect(status).toBe(200);
    expect(data.updateCustomProperties.layer.id).toBe(layerId);
  });

  test("Rename a custom property title", async ({ gqlClient }) => {
    const schema = { colour: { type: "string" }, height: { type: "number" } };
    const { status, data } = await gqlClient.mutate<{
      changeCustomPropertyTitle: { layer: { id: string } };
    }>(CHANGE_CUSTOM_PROPERTY_TITLE, {
      input: { layerId, schema, oldTitle: "color", newTitle: "colour" }
    });

    expect(status).toBe(200);
    expect(data.changeCustomPropertyTitle.layer.id).toBe(layerId);
  });

  test("Remove a custom property", async ({ gqlClient }) => {
    const schema = { height: { type: "number" } };
    const { status, data } = await gqlClient.mutate<{
      removeCustomProperty: { layer: { id: string } };
    }>(REMOVE_CUSTOM_PROPERTY, {
      input: { layerId, schema, removedTitle: "colour" }
    });

    expect(status).toBe(200);
    expect(data.removeCustomProperty.layer.id).toBe(layerId);
  });
});

// Negative scenarios

test.describe("Layer and infobox negative scenarios", () => {
  test("Cannot add a layer to a non-existent scene", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    await expect(
      gqlClient.mutate(ADD_NLS_LAYER_SIMPLE, {
        input: {
          sceneId: fakeSceneId,
          layerType: "simple",
          title: "Ghost Layer",
          visible: true
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent layer", async ({ gqlClient }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_NLS_LAYER, {
        input: { layerId: fakeLayerId, name: "No Such Layer" }
      })
    ).rejects.toThrow();
  });

  test("Cannot remove a non-existent layer", async ({ gqlClient }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_NLS_LAYER, { input: { layerId: fakeLayerId } })
    ).rejects.toThrow();
  });

  test("Cannot duplicate a non-existent layer", async ({ gqlClient }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(DUPLICATE_NLS_LAYER, {
        input: { layerId: fakeLayerId }
      })
    ).rejects.toThrow();
  });

  test("Cannot create infobox on a non-existent layer", async ({
    gqlClient
  }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(CREATE_NLS_INFOBOX, { input: { layerId: fakeLayerId } })
    ).rejects.toThrow();
  });

  test("Cannot add infobox block to a non-existent layer", async ({
    gqlClient
  }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(ADD_NLS_INFOBOX_BLOCK, {
        input: {
          layerId: fakeLayerId,
          pluginId: "reearth",
          extensionId: "textInfoboxBetaBlock"
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot remove infobox from a non-existent layer", async ({
    gqlClient
  }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_NLS_INFOBOX, {
        input: { layerId: fakeLayerId }
      })
    ).rejects.toThrow();
  });

  test("Cannot create photo overlay on a non-existent layer", async ({
    gqlClient
  }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(CREATE_NLS_PHOTO_OVERLAY, {
        input: { layerId: fakeLayerId }
      })
    ).rejects.toThrow();
  });

  test("Cannot update custom properties on a non-existent layer", async ({
    gqlClient
  }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_CUSTOM_PROPERTIES, {
        input: { layerId: fakeLayerId, schema: { foo: { type: "string" } } }
      })
    ).rejects.toThrow();
  });
});
