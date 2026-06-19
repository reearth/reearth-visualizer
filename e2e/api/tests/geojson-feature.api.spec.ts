import { test, expect } from "../fixtures/api-test-fixtures";
import {
  ADD_GEOJSON_FEATURE,
  ADD_NLS_LAYER_SIMPLE,
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_GEOJSON_FEATURE,
  DELETE_PROJECT,
  UPDATE_GEOJSON_FEATURE
} from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

test.describe.configure({ mode: "serial" });
test.describe("GeoJSON feature CRUD lifecycle via API", () => {
  let projectId: string;
  let sceneId: string;
  let layerId: string;
  let featureId: string;

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
        name: "GeoJSON Feature Test",
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;

    const { data: ly } = await gqlClient.mutate<{
      addNLSLayerSimple: {
        layers: { id: string };
      };
    }>(ADD_NLS_LAYER_SIMPLE, {
      input: {
        sceneId,
        layerType: "simple",
        title: "GeoJSON Layer",
        visible: true,
        config: { data: { type: "geojson" } }
      }
    });
    layerId = ly.addNLSLayerSimple.layers.id;
  });

  test("Add a GeoJSON point feature", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      addGeoJSONFeature: {
        type: string;
        id: string;
        geometry: { type: string; pointCoordinates: number[] };
        properties: Record<string, unknown>;
      };
    }>(ADD_GEOJSON_FEATURE, {
      input: {
        layerId,
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [139.6917, 35.6895]
        },
        properties: { name: "Tokyo", population: 14000000 }
      }
    });

    expect(status).toBe(200);
    expect(data.addGeoJSONFeature.type).toBe("Feature");
    expect(data.addGeoJSONFeature.id).toBeTruthy();
    expect(data.addGeoJSONFeature.geometry.type).toBe("Point");
    expect(data.addGeoJSONFeature.geometry.pointCoordinates).toEqual([
      139.6917, 35.6895
    ]);
    expect(data.addGeoJSONFeature.properties).toMatchObject({
      name: "Tokyo"
    });
    featureId = data.addGeoJSONFeature.id;
  });

  test("Update the GeoJSON feature properties", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateGeoJSONFeature: {
        type: string;
        id: string;
        properties: Record<string, unknown>;
      };
    }>(UPDATE_GEOJSON_FEATURE, {
      input: {
        featureId,
        layerId,
        properties: { name: "Tokyo Updated", population: 14100000 }
      }
    });

    expect(status).toBe(200);
    expect(data.updateGeoJSONFeature.id).toBe(featureId);
    expect(data.updateGeoJSONFeature.properties).toMatchObject({
      name: "Tokyo Updated",
      population: 14100000
    });
  });

  test("Update the GeoJSON feature geometry", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateGeoJSONFeature: {
        id: string;
        geometry: { type: string; pointCoordinates: number[] };
      };
    }>(UPDATE_GEOJSON_FEATURE, {
      input: {
        featureId,
        layerId,
        geometry: {
          type: "Point",
          coordinates: [135.5023, 34.6937]
        }
      }
    });

    expect(status).toBe(200);
    expect(data.updateGeoJSONFeature.geometry.pointCoordinates).toEqual([
      135.5023, 34.6937
    ]);
  });

  test("Delete the GeoJSON feature", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      deleteGeoJSONFeature: { deletedFeatureId: string };
    }>(DELETE_GEOJSON_FEATURE, {
      input: { featureId, layerId }
    });

    expect(status).toBe(200);
    expect(data.deleteGeoJSONFeature.deletedFeatureId).toBe(featureId);
  });
});

// Negative scenarios
test.describe("GeoJSON feature negative scenarios", () => {
  test("Cannot add feature to a non-existent layer", async ({
    gqlClient
  }) => {
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(ADD_GEOJSON_FEATURE, {
        input: {
          layerId: fakeLayerId,
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: {}
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent feature", async ({ gqlClient }) => {
    const fakeFeatureId = generateFakeId();
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_GEOJSON_FEATURE, {
        input: {
          featureId: fakeFeatureId,
          layerId: fakeLayerId,
          properties: { name: "ghost" }
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot delete a non-existent feature", async ({ gqlClient }) => {
    const fakeFeatureId = generateFakeId();
    const fakeLayerId = generateFakeId();
    await expect(
      gqlClient.mutate(DELETE_GEOJSON_FEATURE, {
        input: { featureId: fakeFeatureId, layerId: fakeLayerId }
      })
    ).rejects.toThrow();
  });
});
