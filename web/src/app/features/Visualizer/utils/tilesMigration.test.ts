import { describe, expect, it } from "vitest";

import { migrateViewerPropertyTiles, __testing__ } from "./tilesMigration";

const { TILE_TYPE_MIGRATION_MAP, CESIUM_ION_ASSET_ID_FALLBACK_MAP, needsTileMigration, migrateTile, migrateTerrain } = __testing__;

describe("tilesMigration", () => {
  describe("migrateViewerPropertyTiles", () => {
    it("should return undefined when viewerProperty is undefined", () => {
      const result = migrateViewerPropertyTiles(undefined, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBeUndefined();
    });

    it("should return original viewerProperty when no tiles present", () => {
      const viewerProperty = { tiles: undefined };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty);
    });

    it("should return original viewerProperty when no migration needed", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "open_street_map" }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty);
    });

    it("should apply defaultTileType to tiles without type when defaultTileType is provided", () => {
      const viewerProperty = {
        tiles: [
          { id: "1" },
          { id: "2", type: undefined }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        defaultTileType: "open_street_map",
        hasAccessToken: false
      });
      expect(result?.tiles).toEqual([
        { id: "1", type: "open_street_map" },
        { id: "2", type: "open_street_map" }
      ]);
    });

    it("should NOT apply type to tiles without type when defaultTileType is not provided", () => {
      const viewerProperty = {
        tiles: [
          { id: "1" },
          { id: "2", type: undefined }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // No migration, returns original
    });

    it("should migrate deprecated tile types in EE environment without token (applies fallback)", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "default" },
          { id: "2", type: "default_label" },
          { id: "3", type: "default_road" },
          { id: "4", type: "black_marble" }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: false
      });
      // Without token: deprecated → cesium_ion → fallback to google_satellite/etc
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2 },
        { id: "2", type: "google_satellite", cesiumIonAssetId: 3 },
        { id: "3", type: "google_roadmap", cesiumIonAssetId: 4 },
        { id: "4", type: "nasa_black_marble", cesiumIonAssetId: 3812 }
      ]);
    });

    it("should migrate deprecated tile types to cesium_ion in EE environment with token (no fallback)", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "default" },
          { id: "2", type: "default_label" },
          { id: "3", type: "default_road" },
          { id: "4", type: "black_marble" }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: true
      });
      // With token: deprecated → cesium_ion (stays as cesium_ion, no fallback)
      expect(result?.tiles).toEqual([
        { id: "1", type: "cesium_ion", cesiumIonAssetId: 2 },
        { id: "2", type: "cesium_ion", cesiumIonAssetId: 3 },
        { id: "3", type: "cesium_ion", cesiumIonAssetId: 4 },
        { id: "4", type: "cesium_ion", cesiumIonAssetId: 3812 }
      ]);
    });

    it("should apply Cesium Ion fallback in EE environment without token", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "cesium_ion" as const, cesiumIonAssetId: 2 },
          { id: "2", type: "cesium_ion" as const, cesiumIonAssetId: 3 },
          { id: "3", type: "cesium_ion" as const, cesiumIonAssetId: 4 },
          { id: "4", type: "cesium_ion" as const, cesiumIonAssetId: 3812 }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2 },
        { id: "2", type: "google_satellite", cesiumIonAssetId: 3 },
        { id: "3", type: "google_roadmap", cesiumIonAssetId: 4 },
        { id: "4", type: "nasa_black_marble", cesiumIonAssetId: 3812 }
      ]);
    });

    it("should NOT apply Cesium Ion fallback when token is available", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "cesium_ion", cesiumIonAssetId: 2 }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: true
      });
      expect(result).toBe(viewerProperty); // No migration, returns original
    });

    it("should NOT migrate deprecated types in non-EE environment", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "default" },
          { id: "2", type: "default_road" }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // No migration in non-EE
    });

    it("should handle multiple tiles with mixed migration needs", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "open_street_map" }, // No migration
          { id: "2" }, // Needs default application
          { id: "3", type: "default" }, // Needs EE migration + fallback
          { id: "4", type: "cesium_ion", cesiumIonAssetId: 2 }, // Needs fallback
          { id: "5", type: "google_satellite" } // No migration
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        defaultTileType: "open_street_map",
        hasAccessToken: false
      });
      expect(result?.tiles).toEqual([
        { id: "1", type: "open_street_map" },
        { id: "2", type: "open_street_map" }, // Default applied
        { id: "3", type: "google_satellite", cesiumIonAssetId: 2 }, // Migrated + fallback
        { id: "4", type: "google_satellite", cesiumIonAssetId: 2 }, // Fallback
        { id: "5", type: "google_satellite" }
      ]);
    });

    it("should NOT migrate Cesium Ion tiles with unknown asset IDs", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "cesium_ion", cesiumIonAssetId: 999999 }
        ]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // Unknown asset ID, no fallback available
    });

    it("should migrate terrain when type is cesium and no token provided", () => {
      const viewerProperty = {
        terrain: { type: "cesium" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result?.terrain).toEqual({
        type: "reearth_terrain",
        enabled: true
      });
    });

    it("should NOT migrate cesiumion terrain when no token (user's explicit choice)", () => {
      const viewerProperty = {
        terrain: { type: "cesiumion" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // No migration — cesiumion without token is expected to fail
    });

    it("should NOT migrate terrain when token is available", () => {
      const viewerProperty = {
        terrain: { type: "cesiumion" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: true
      });
      expect(result).toBe(viewerProperty); // No migration
    });

    it("should migrate both tiles and terrain together", () => {
      const viewerProperty = {
        tiles: [
          { id: "1", type: "default" as const },
          { id: "2", type: "cesium_ion" as const, cesiumIonAssetId: 2 }
        ],
        terrain: { type: "cesium" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2 }, // Migrated + fallback
        { id: "2", type: "google_satellite", cesiumIonAssetId: 2 } // Fallback
      ]);
      expect(result?.terrain).toEqual({
        type: "reearth_terrain",
        enabled: true
      });
    });

    it("should migrate both tiles and cesium terrain when no token", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "default" as const }],
        terrain: { type: "cesium" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result?.tiles).toEqual([{ id: "1", type: "google_satellite", cesiumIonAssetId: 2 }]); // Migrated + fallback
      expect(result?.terrain).toEqual({ type: "reearth_terrain", enabled: true });
    });

    it("should only migrate terrain when tiles don't need migration", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "open_street_map" as const }],
        terrain: { type: "cesium" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result?.tiles).toBe(viewerProperty.tiles); // Unchanged
      expect(result?.terrain).toEqual({
        type: "reearth_terrain",
        enabled: true
      });
    });

    it("should return original viewerProperty when neither tiles nor terrain need migration", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "open_street_map" as const }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        terrain: { type: "reearth_terrain" as any, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // No migration
    });

    it("should apply defaultTerrainType to terrain without type when defaultTerrainType is provided", () => {
      const viewerProperty = {
        terrain: { enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        defaultTerrainType: "reearth_terrain",
        hasAccessToken: false
      });
      expect(result?.terrain).toEqual({
        enabled: true,
        type: "reearth_terrain"
      });
    });

    it("should NOT apply type to terrain without type when defaultTerrainType is not provided", () => {
      const viewerProperty = {
        terrain: { enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // No migration
    });

    it("should migrate tiles and apply defaultTerrainType when both need processing", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "default" as const }],
        terrain: { enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        defaultTerrainType: "reearth_terrain",
        hasAccessToken: false
      });
      expect(result?.tiles).toEqual([{ id: "1", type: "google_satellite", cesiumIonAssetId: 2 }]); // Migrated + fallback
      expect(result?.terrain).toEqual({
        enabled: true,
        type: "reearth_terrain"
      });
    });

    it("should only migrate tiles when terrain has no type and no defaultTerrainType", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "default" as const }],
        terrain: { enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result?.tiles).toEqual([{ id: "1", type: "google_satellite", cesiumIonAssetId: 2 }]); // Migrated + fallback
      expect(result?.terrain).toBe(viewerProperty.terrain); // Unchanged
    });
  });

  describe("needsTileMigration", () => {
    it("should return true for tiles without type when defaultTileType is provided", () => {
      const result = needsTileMigration(
        { type: undefined },
        { isEE: false, defaultTileType: "open_street_map", hasAccessToken: false }
      );
      expect(result).toBe(true);
    });

    it("should return false for tiles without type when defaultTileType is not provided", () => {
      const result = needsTileMigration(
        { type: undefined },
        { isEE: false, hasAccessToken: false }
      );
      expect(result).toBe(false);
    });

    it("should return true for deprecated tile types in EE", () => {
      expect(
        needsTileMigration(
          { type: "default" },
          { isEE: true, hasAccessToken: false }
        )
      ).toBe(true);

      expect(
        needsTileMigration(
          { type: "default_road" },
          { isEE: true, hasAccessToken: false }
        )
      ).toBe(true);
    });

    it("should return false for deprecated tile types in non-EE", () => {
      const result = needsTileMigration(
        { type: "default" },
        { isEE: false, hasAccessToken: false }
      );
      expect(result).toBe(false);
    });

    it("should return true for cesium_ion tiles without token in EE", () => {
      const result = needsTileMigration(
        { type: "cesium_ion", cesiumIonAssetId: 2 },
        { isEE: true, hasAccessToken: false }
      );
      expect(result).toBe(true);
    });

    it("should return false for cesium_ion tiles with token", () => {
      const result = needsTileMigration(
        { type: "cesium_ion", cesiumIonAssetId: 2 },
        { isEE: true, hasAccessToken: true }
      );
      expect(result).toBe(false);
    });

    it("should return false for cesium_ion tiles with unknown asset ID", () => {
      const result = needsTileMigration(
        { type: "cesium_ion", cesiumIonAssetId: 999999 },
        { isEE: true, hasAccessToken: false }
      );
      expect(result).toBe(false);
    });

    it("should return false for standard tile types", () => {
      const result = needsTileMigration(
        { type: "open_street_map" },
        { isEE: true, hasAccessToken: false }
      );
      expect(result).toBe(false);
    });
  });

  describe("migrateTile", () => {
    it("should apply defaultTileType when type is missing", () => {
      const tile = { id: "1", type: undefined, opacity: 0.8 };
      const result = migrateTile(tile, {
        isEE: false,
        defaultTileType: "open_street_map",
        hasAccessToken: false
      });
      expect(result).toEqual({
        id: "1",
        type: "open_street_map",
        opacity: 0.8
      });
    });

    it("should NOT apply type when type is missing and defaultTileType is not provided", () => {
      const tile = { id: "1", type: undefined, opacity: 0.8 };
      const result = migrateTile(tile, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(tile); // Returns original unchanged
    });

    it("should NOT apply default type when tile already has type", () => {
      const tile = { id: "1", type: "google_satellite" };
      const result = migrateTile(tile, {
        isEE: false,
        defaultTileType: "open_street_map",
        hasAccessToken: false
      });
      expect(result).toBe(tile); // Returns original unchanged
    });

    it("should migrate deprecated types in EE environment without token (applies fallback)", () => {
      const tile = { id: "1", type: "default" };
      const result = migrateTile(tile, {
        isEE: true,
        hasAccessToken: false
      });
      // Without token: deprecated → cesium_ion → fallback to google_satellite
      expect(result).toEqual({
        id: "1",
        type: "google_satellite",
        cesiumIonAssetId: 2
      });
    });

    it("should migrate deprecated types to cesium_ion in EE environment with token (no fallback)", () => {
      const tile = { id: "1", type: "default" };
      const result = migrateTile(tile, {
        isEE: true,
        hasAccessToken: true
      });
      // With token: deprecated → cesium_ion (stays as cesium_ion)
      expect(result).toEqual({
        id: "1",
        type: "cesium_ion",
        cesiumIonAssetId: 2
      });
    });

    it("should NOT migrate deprecated types in non-EE environment", () => {
      const tile = { id: "1", type: "default" };
      const result = migrateTile(tile, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(tile); // Returns original unchanged
    });

    it("should apply Cesium Ion fallback for known asset IDs without token", () => {
      const tile = { id: "1", type: "cesium_ion", cesiumIonAssetId: 2 };
      const result = migrateTile(tile, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toEqual({
        id: "1",
        type: "google_satellite",
        cesiumIonAssetId: 2
      });
    });

    it("should handle asset ID as number", () => {
      const tile = { id: "1", type: "cesium_ion" as const, cesiumIonAssetId: 3 };
      const result = migrateTile(tile, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toEqual({
        id: "1",
        type: "google_satellite",
        cesiumIonAssetId: 3
      });
    });

    it("should NOT apply fallback when access token is available", () => {
      const tile = { id: "1", type: "cesium_ion", cesiumIonAssetId: 2 };
      const result = migrateTile(tile, {
        isEE: true,
        hasAccessToken: true
      });
      expect(result).toBe(tile); // Returns original unchanged
    });

    it("should NOT apply fallback for unknown asset IDs", () => {
      const tile = { id: "1", type: "cesium_ion", cesiumIonAssetId: 999999 };
      const result = migrateTile(tile, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toBe(tile); // Returns original unchanged
    });

    it("should preserve all tile properties during migration", () => {
      const tile = {
        id: "1",
        type: "default",
        opacity: 0.5,
        zoomLevel: [1, 10],
        customProp: "value"
      };
      const result = migrateTile(tile, {
        isEE: true,
        hasAccessToken: false
      });
      expect(result).toEqual({
        id: "1",
        type: "google_satellite",
        cesiumIonAssetId: 2,
        opacity: 0.5,
        zoomLevel: [1, 10],
        customProp: "value"
      });
    });
  });

  describe("migrateTerrain", () => {
    it("should return undefined when terrain is undefined", () => {
      const result = migrateTerrain(undefined, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBeUndefined();
    });

    it("should NOT fallback cesiumion terrain when no token (user's explicit choice)", () => {
      const terrain = { type: "cesiumion", enabled: true, normal: true };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(terrain); // No migration
    });

    it("should NOT fallback cesiumion terrain regardless of token (user's explicit choice)", () => {
      const terrainNoToken = { type: "cesiumion", enabled: true };
      expect(migrateTerrain(terrainNoToken, { isEE: false, hasAccessToken: false })).toBe(terrainNoToken);

      const terrainWithToken = { type: "cesiumion", enabled: true };
      expect(migrateTerrain(terrainWithToken, { isEE: false, hasAccessToken: true })).toBe(terrainWithToken);
    });

    it("should NOT modify terrain with other types", () => {
      // reearth_terrain should never be remapped
      const terrain = { type: "reearth_terrain", enabled: true };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(terrain);
    });

    it("should fallback cesium terrain to reearth_terrain when no token", () => {
      const terrain = { type: "cesium", enabled: true };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual({ type: "reearth_terrain", enabled: true });
    });

    it("should NOT fallback cesium terrain when token is available", () => {
      const terrain = { type: "cesium", enabled: true };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: true
      });
      expect(result).toBe(terrain);
    });

    it("should preserve all terrain properties during cesium migration", () => {
      const terrain = {
        type: "cesium" as const,
        enabled: true,
        url: "https://example.com/terrain",
        normal: true,
        elevationHeatMap: {
          type: "custom" as const,
          minHeight: 0,
          maxHeight: 1000
        }
      };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toEqual({
        type: "reearth_terrain",
        enabled: true,
        url: "https://example.com/terrain",
        normal: true,
        elevationHeatMap: {
          type: "custom",
          minHeight: 0,
          maxHeight: 1000
        }
      });
    });

    it("should NOT migrate when enabled without type (use schema defaults)", () => {
      const terrain = { enabled: true };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(terrain); // Returns original unchanged
    });

    it("should apply defaultTerrainType when type is undefined", () => {
      const terrain = { enabled: true, type: undefined };
      const result = migrateTerrain(terrain, {
        isEE: false,
        defaultTerrainType: "reearth_terrain",
        hasAccessToken: false
      });
      expect(result).toEqual({
        enabled: true,
        type: "reearth_terrain"
      });
    });

    it("should NOT apply type when type is undefined and defaultTerrainType is not provided", () => {
      const terrain = { enabled: true, type: undefined };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(terrain); // Returns original unchanged
    });

    it("should NOT apply defaultTerrainType when terrain already has a type", () => {
      const terrain = { enabled: true, type: "cesiumion" };
      const result = migrateTerrain(terrain, {
        isEE: false,
        defaultTerrainType: "reearth_terrain",
        hasAccessToken: false
      });
      expect(result).toBe(terrain); // Returns original unchanged
    });

    it("should NOT fallback when terrain is disabled without type", () => {
      const terrain = { enabled: false };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(terrain); // Returns original unchanged
    });

    it("should NOT fallback when enabled is undefined and no type", () => {
      const terrain = { type: undefined, enabled: undefined, normal: true };
      const result = migrateTerrain(terrain, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(terrain); // Returns original unchanged
    });
  });

  describe("Migration maps", () => {
    it("should have correct tile type migration map", () => {
      expect(TILE_TYPE_MIGRATION_MAP).toEqual({
        default: { type: "cesium_ion", cesiumIonAssetId: 2 },
        default_label: { type: "cesium_ion", cesiumIonAssetId: 3 },
        default_road: { type: "cesium_ion", cesiumIonAssetId: 4 },
        black_marble: { type: "cesium_ion", cesiumIonAssetId: 3812 }
      });
    });

    it("should have correct Cesium Ion asset ID fallback map", () => {
      expect(CESIUM_ION_ASSET_ID_FALLBACK_MAP).toEqual({
        "2": "google_satellite",
        "3": "google_satellite",
        "4": "google_roadmap",
        "3812": "nasa_black_marble"
      });
    });
  });
});
