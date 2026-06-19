import { describe, expect, it } from "vitest";

import { migrateLayers, __testing__ } from "./layersMigration";

const {
  needsLayerMigration,
  migrateLayer,
  migrateLayerRecursive,
  checkLayerTreeNeedsMigration
} = __testing__;

describe("layersMigration", () => {
  describe("migrateLayers", () => {
    it("should return undefined when layers is undefined", () => {
      const result = migrateLayers(undefined, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBeUndefined();
    });

    it("should return original layers when empty array", () => {
      const layers: any[] = [];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(layers);
    });

    it("should return original layers when no migration needed", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "geojson" as const }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(layers);
    });

    it("should migrate osm-buildings to reearth-buildings when no token", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "osm-buildings" as const }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual([
        {
          id: "1",
          type: "simple",
          data: { type: "reearth-buildings" }
        }
      ]);
    });

    it("should NOT migrate osm-buildings when token is available", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "osm-buildings" as const }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: true
      });
      expect(result).toBe(layers); // No migration
    });

    it("should migrate nested layers in groups", () => {
      const layers = [
        {
          id: "group1",
          type: "group" as const,
          children: [
            {
              id: "2",
              type: "simple" as const,
              data: { type: "osm-buildings" as const }
            }
          ]
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual([
        {
          id: "group1",
          type: "group",
          children: [
            {
              id: "2",
              type: "simple",
              data: { type: "reearth-buildings" }
            }
          ]
        }
      ]);
    });

    it("should migrate deeply nested layers", () => {
      const layers = [
        {
          id: "group1",
          type: "group" as const,
          children: [
            {
              id: "group2",
              type: "group" as const,
              children: [
                {
                  id: "3",
                  type: "simple" as const,
                  data: { type: "osm-buildings" as const }
                }
              ]
            }
          ]
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(
        result?.[0].type === "group" &&
          result[0].children?.[0].type === "group" &&
          result[0].children[0].children
      ).toEqual([
        {
          id: "3",
          type: "simple",
          data: { type: "reearth-buildings" }
        }
      ]);
    });

    it("should handle mixed layers with and without migration", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "geojson" as const }
        },
        {
          id: "2",
          type: "simple" as const,
          data: { type: "osm-buildings" as const }
        },
        {
          id: "3",
          type: "simple" as const,
          data: { type: "3dtiles" as const }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual([
        {
          id: "1",
          type: "simple",
          data: { type: "geojson" }
        },
        {
          id: "2",
          type: "simple",
          data: { type: "reearth-buildings" }
        },
        {
          id: "3",
          type: "simple",
          data: { type: "3dtiles" }
        }
      ]);
    });

    it("should preserve all layer properties during migration", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          title: "Buildings Layer",
          visible: true,
          data: {
            type: "osm-buildings" as const,
            url: "https://example.com/data"
          },
          properties: { color: "red" }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual([
        {
          id: "1",
          type: "simple",
          title: "Buildings Layer",
          visible: true,
          data: {
            type: "reearth-buildings",
            url: "https://example.com/data"
          },
          properties: { color: "red" }
        }
      ]);
    });

    it("should set provider to reearth for google-photorealistic without provider in EE", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "google-photorealistic" as const }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toEqual([
        {
          id: "1",
          type: "simple",
          data: { type: "google-photorealistic", provider: "reearth" }
        }
      ]);
    });

    it("should set provider to reearth for google-photorealistic with cesium-ion provider but no token in EE", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: {
            type: "google-photorealistic" as const,
            provider: "cesium-ion"
          }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toEqual([
        {
          id: "1",
          type: "simple",
          data: { type: "google-photorealistic", provider: "reearth" }
        }
      ]);
    });

    it("should NOT set provider for google-photorealistic with cesium-ion when token is available", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: {
            type: "google-photorealistic" as const,
            provider: "cesium-ion"
          }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: true,
        hasAccessToken: true
      });
      expect(result).toBe(layers);
    });

    it("should NOT set provider for google-photorealistic in non-EE environment", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "google-photorealistic" as const }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(layers);
    });

    it("should NOT modify google-photorealistic with reearth provider", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "google-photorealistic" as const, provider: "reearth" }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toBe(layers);
    });

    it("should handle both osm-buildings and google-photorealistic migrations together", () => {
      const layers = [
        {
          id: "1",
          type: "simple" as const,
          data: { type: "osm-buildings" as const }
        },
        {
          id: "2",
          type: "simple" as const,
          data: { type: "google-photorealistic" as const }
        }
      ];
      const result = migrateLayers(layers, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toEqual([
        {
          id: "1",
          type: "simple",
          data: { type: "reearth-buildings" }
        },
        {
          id: "2",
          type: "simple",
          data: { type: "google-photorealistic", provider: "reearth" }
        }
      ]);
    });
  });

  describe("needsLayerMigration", () => {
    it("should return false for group layers", () => {
      const layer = {
        id: "group1",
        type: "group" as const,
        children: []
      };
      const result = needsLayerMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(false);
    });

    it("should return false for simple layer without data", () => {
      const layer = {
        id: "1",
        type: "simple" as const
      };
      const result = needsLayerMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(false);
    });

    it("should return true for osm-buildings without token", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "osm-buildings" as const }
      };
      const result = needsLayerMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(true);
    });

    it("should return false for osm-buildings with token", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "osm-buildings" as const }
      };
      const result = needsLayerMigration(layer, {
        isEE: false,
        hasAccessToken: true
      });
      expect(result).toBe(false);
    });

    it("should return false for other data types", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "geojson" as const }
      };
      const result = needsLayerMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(false);
    });

    it("should return true for google-photorealistic without provider in EE", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const }
      };
      const result = needsLayerMigration(layer, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toBe(true);
    });

    it("should return true for google-photorealistic with cesium-ion provider but no token in EE", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const, provider: "cesium-ion" }
      };
      const result = needsLayerMigration(layer, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toBe(true);
    });

    it("should return false for google-photorealistic with cesium-ion provider and token in EE", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const, provider: "cesium-ion" }
      };
      const result = needsLayerMigration(layer, {
        isEE: true,
        hasAccessToken: true
      });
      expect(result).toBe(false);
    });

    it("should return false for google-photorealistic in non-EE environment", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const }
      };
      const result = needsLayerMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(false);
    });

    it("should return false for google-photorealistic with reearth provider", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const, provider: "reearth" }
      };
      const result = needsLayerMigration(layer, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toBe(false);
    });
  });

  describe("migrateLayer", () => {
    it("should migrate osm-buildings to reearth-buildings without token", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "osm-buildings" as const, url: "test.com" }
      };
      const result = migrateLayer(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual({
        id: "1",
        type: "simple",
        data: { type: "reearth-buildings", url: "test.com" }
      });
    });

    it("should NOT migrate osm-buildings with token", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "osm-buildings" as const }
      };
      const result = migrateLayer(layer, { isEE: false, hasAccessToken: true });
      expect(result).toBe(layer);
    });

    it("should NOT migrate group layers", () => {
      const layer = {
        id: "group1",
        type: "group" as const,
        children: []
      };
      const result = migrateLayer(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(layer);
    });

    it("should NOT migrate simple layers without data", () => {
      const layer = {
        id: "1",
        type: "simple" as const
      };
      const result = migrateLayer(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(layer);
    });

    it("should preserve all data properties", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: {
          type: "osm-buildings" as const,
          url: "https://example.com",
          parameters: { foo: "bar" }
        }
      };
      const result = migrateLayer(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result.type === "simple" && result.data).toEqual({
        type: "reearth-buildings",
        url: "https://example.com",
        parameters: { foo: "bar" }
      });
    });

    it("should set provider to reearth for google-photorealistic without provider in EE", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const, url: "test.com" }
      };
      const result = migrateLayer(layer, { isEE: true, hasAccessToken: false });
      expect(result).toEqual({
        id: "1",
        type: "simple",
        data: {
          type: "google-photorealistic",
          url: "test.com",
          provider: "reearth"
        }
      });
    });

    it("should set provider to reearth for google-photorealistic with cesium-ion but no token in EE", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const, provider: "cesium-ion" }
      };
      const result = migrateLayer(layer, { isEE: true, hasAccessToken: false });
      expect(result).toEqual({
        id: "1",
        type: "simple",
        data: { type: "google-photorealistic", provider: "reearth" }
      });
    });

    it("should NOT modify google-photorealistic with cesium-ion when token is available", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const, provider: "cesium-ion" }
      };
      const result = migrateLayer(layer, { isEE: true, hasAccessToken: true });
      expect(result).toBe(layer);
    });

    it("should NOT modify google-photorealistic in non-EE environment", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "google-photorealistic" as const }
      };
      const result = migrateLayer(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(layer);
    });

    it("should preserve all data properties when setting provider for google-photorealistic", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: {
          type: "google-photorealistic" as const,
          url: "https://example.com",
          parameters: { foo: "bar" }
        }
      };
      const result = migrateLayer(layer, { isEE: true, hasAccessToken: false });
      expect(result.type === "simple" && result.data).toEqual({
        type: "google-photorealistic",
        url: "https://example.com",
        parameters: { foo: "bar" },
        provider: "reearth"
      });
    });
  });

  describe("migrateLayerRecursive", () => {
    it("should migrate simple layer", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "osm-buildings" as const }
      };
      const result = migrateLayerRecursive(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual({
        id: "1",
        type: "simple",
        data: { type: "reearth-buildings" }
      });
    });

    it("should migrate children in group layer", () => {
      const layer = {
        id: "group1",
        type: "group" as const,
        children: [
          {
            id: "1",
            type: "simple" as const,
            data: { type: "osm-buildings" as const }
          }
        ]
      };
      const result = migrateLayerRecursive(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual({
        id: "group1",
        type: "group",
        children: [
          {
            id: "1",
            type: "simple",
            data: { type: "reearth-buildings" }
          }
        ]
      });
    });

    it("should NOT modify group with empty children array", () => {
      const layer = {
        id: "group1",
        type: "group" as const,
        children: []
      };
      const result = migrateLayerRecursive(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(layer);
    });
  });

  describe("checkLayerTreeNeedsMigration", () => {
    it("should return true when layer needs migration", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "osm-buildings" as const }
      };
      const result = checkLayerTreeNeedsMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(true);
    });

    it("should return false when layer doesn't need migration", () => {
      const layer = {
        id: "1",
        type: "simple" as const,
        data: { type: "geojson" as const }
      };
      const result = checkLayerTreeNeedsMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(false);
    });

    it("should return true when child needs migration", () => {
      const layer = {
        id: "group1",
        type: "group" as const,
        children: [
          {
            id: "1",
            type: "simple" as const,
            data: { type: "osm-buildings" as const }
          }
        ]
      };
      const result = checkLayerTreeNeedsMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(true);
    });

    it("should return true for deeply nested layer needing migration", () => {
      const layer = {
        id: "group1",
        type: "group" as const,
        children: [
          {
            id: "group2",
            type: "group" as const,
            children: [
              {
                id: "1",
                type: "simple" as const,
                data: { type: "osm-buildings" as const }
              }
            ]
          }
        ]
      };
      const result = checkLayerTreeNeedsMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(true);
    });

    it("should return false for group with empty children", () => {
      const layer = {
        id: "group1",
        type: "group" as const,
        children: []
      };
      const result = checkLayerTreeNeedsMigration(layer, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(false);
    });
  });
});
