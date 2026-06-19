import { describe, expect, it } from "vitest";

import { migrateViewerPropertyTiles, __testing__ } from "./tilesMigration";

const {
  TILE_TYPE_MIGRATION_MAP,
  CESIUM_ION_ASSET_ID_FALLBACK_MAP,
  needsTileMigration,
  migrateTile,
  migrateTerrain,
  extractStreetViewTiles
} = __testing__;

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
        tiles: [{ id: "1", type: "open_street_map" }]
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty);
    });

    it("should apply defaultTileType to tiles without type when defaultTileType is provided", () => {
      const viewerProperty = {
        tiles: [{ id: "1" }, { id: "2", type: undefined }]
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
        tiles: [{ id: "1" }, { id: "2", type: undefined }]
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
      // Opacity is set to 1 for all tiles because Google tiles are present
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 },
        { id: "2", type: "google_satellite", cesiumIonAssetId: 3, opacity: 1 },
        { id: "3", type: "google_roadmap", cesiumIonAssetId: 4, opacity: 1 },
        {
          id: "4",
          type: "nasa_black_marble",
          cesiumIonAssetId: 3812,
          opacity: 1
        }
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
      // Opacity is set to 1 for all tiles because Google tiles are present
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 },
        { id: "2", type: "google_satellite", cesiumIonAssetId: 3, opacity: 1 },
        { id: "3", type: "google_roadmap", cesiumIonAssetId: 4, opacity: 1 },
        {
          id: "4",
          type: "nasa_black_marble",
          cesiumIonAssetId: 3812,
          opacity: 1
        }
      ]);
    });

    it("should NOT apply Cesium Ion fallback when token is available", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "cesium_ion", cesiumIonAssetId: 2 }]
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
      // Opacity is set to 1 for all tiles because Google tiles are present
      expect(result?.tiles).toEqual([
        { id: "1", type: "open_street_map", opacity: 1 },
        { id: "2", type: "open_street_map", opacity: 1 }, // Default applied
        { id: "3", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 }, // Migrated + fallback
        { id: "4", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 }, // Fallback
        { id: "5", type: "google_satellite", opacity: 1 }
      ]);
    });

    it("should NOT migrate Cesium Ion tiles with unknown asset IDs", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "cesium_ion", cesiumIonAssetId: 999999 }]
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
        enabled: true,
        normal: true
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
      // Opacity is set to 1 for all tiles because Google tiles are present
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 }, // Migrated + fallback
        { id: "2", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 } // Fallback
      ]);
      expect(result?.terrain).toEqual({
        type: "reearth_terrain",
        enabled: true,
        normal: true
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
      // Opacity is set to 1 because Google tiles are present
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 }
      ]); // Migrated + fallback
      expect(result?.terrain).toEqual({
        type: "reearth_terrain",
        enabled: true,
        normal: true
      });
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
        enabled: true,
        normal: true
      });
    });

    it("should return original viewerProperty when neither tiles nor terrain need migration", () => {
      const viewerProperty = {
        tiles: [{ id: "1", type: "open_street_map" as const }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        terrain: { type: "reearth_terrain" as any, enabled: true, normal: true }
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
        type: "reearth_terrain",
        normal: true
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

    it("should set normal=true for reearth_terrain when enabled", () => {
      const viewerProperty = {
        terrain: { type: "reearth_terrain" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result?.terrain).toEqual({
        type: "reearth_terrain",
        enabled: true,
        normal: true
      });
    });

    it("should NOT set normal=true for reearth_terrain when disabled", () => {
      const viewerProperty = {
        terrain: { type: "reearth_terrain" as const, enabled: false }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // No change for disabled terrain
    });

    it("should NOT override normal if already set to true", () => {
      const viewerProperty = {
        terrain: { type: "reearth_terrain" as const, enabled: true, normal: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result).toBe(viewerProperty); // No change needed
    });

    it("should set normal=true even if it was explicitly false", () => {
      const viewerProperty = {
        terrain: { type: "reearth_terrain" as const, enabled: true, normal: false }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: false
      });
      expect(result?.terrain).toEqual({
        type: "reearth_terrain",
        enabled: true,
        normal: true
      });
    });

    it("should NOT set normal for non-reearth_terrain types", () => {
      const viewerProperty = {
        terrain: { type: "cesium" as const, enabled: true }
      };
      const result = migrateViewerPropertyTiles(viewerProperty, {
        isEE: false,
        hasAccessToken: true // Token available, no fallback
      });
      expect(result).toBe(viewerProperty); // No change for other terrain types
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
      // Opacity is set to 1 because Google tiles are present
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 }
      ]); // Migrated + fallback
      expect(result?.terrain).toEqual({
        enabled: true,
        type: "reearth_terrain",
        normal: true
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
      // Opacity is set to 1 because Google tiles are present
      expect(result?.tiles).toEqual([
        { id: "1", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 }
      ]); // Migrated + fallback
      expect(result?.terrain).toBe(viewerProperty.terrain); // Unchanged
    });
  });

  describe("needsTileMigration", () => {
    it("should return true for tiles without type when defaultTileType is provided", () => {
      const result = needsTileMigration(
        { type: undefined },
        {
          isEE: false,
          defaultTileType: "open_street_map",
          hasAccessToken: false
        }
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
      const tile = {
        id: "1",
        type: "cesium_ion" as const,
        cesiumIonAssetId: 3
      };
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
      expect(
        migrateTerrain(terrainNoToken, { isEE: false, hasAccessToken: false })
      ).toBe(terrainNoToken);

      const terrainWithToken = { type: "cesiumion", enabled: true };
      expect(
        migrateTerrain(terrainWithToken, { isEE: false, hasAccessToken: true })
      ).toBe(terrainWithToken);
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

  describe("Google Maps opacity override", () => {
    describe("migrateViewerPropertyTiles", () => {
      it("should set opacity to 1 for all Google Maps tiles", () => {
        const viewerProperty = {
          tiles: [
            { id: "1", type: "google_satellite", opacity: 0.5 },
            { id: "2", type: "google_roadmap", opacity: 0.7 }
          ]
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false
        });
        expect(result?.tiles).toEqual([
          { id: "1", type: "google_satellite", opacity: 1 },
          { id: "2", type: "google_roadmap", opacity: 1 }
        ]);
      });

      it("should set opacity to 1 for all tiles when Google tiles are present", () => {
        const viewerProperty = {
          tiles: [
            { id: "1", type: "google_satellite", opacity: 0.5 },
            { id: "2", type: "open_street_map", opacity: 0.7 },
            { id: "3", type: "cesium_ion", opacity: 0.8, cesiumIonAssetId: 999 }
          ]
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false
        });
        expect(result?.tiles).toEqual([
          { id: "1", type: "google_satellite", opacity: 1 },
          { id: "2", type: "open_street_map", opacity: 1 },
          { id: "3", type: "cesium_ion", opacity: 1, cesiumIonAssetId: 999 }
        ]);
      });

      it("should NOT modify opacity when no Google tiles are present", () => {
        const viewerProperty = {
          tiles: [
            { id: "1", type: "open_street_map", opacity: 0.5 },
            { id: "2", type: "cesium_ion", opacity: 0.7, cesiumIonAssetId: 999 }
          ]
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false
        });
        expect(result).toBe(viewerProperty); // No migration needed
      });

      it("should set opacity to 1 when Google tile results from fallback", () => {
        const viewerProperty = {
          tiles: [
            { id: "1", type: "cesium_ion", cesiumIonAssetId: 2, opacity: 0.5 }, // Falls back to google_satellite
            { id: "2", type: "open_street_map", opacity: 0.7 }
          ]
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: true,
          hasAccessToken: false
        });
        expect(result?.tiles).toEqual([
          {
            id: "1",
            type: "google_satellite",
            cesiumIonAssetId: 2,
            opacity: 1
          },
          { id: "2", type: "open_street_map", opacity: 1 }
        ]);
      });

      it("should detect Google tiles from defaultTileType", () => {
        const viewerProperty = {
          tiles: [
            { id: "1" }, // Will get google_satellite from default
            { id: "2", type: "open_street_map", opacity: 0.7 }
          ]
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          defaultTileType: "google_satellite",
          hasAccessToken: false
        });
        expect(result?.tiles).toEqual([
          { id: "1", type: "google_satellite", opacity: 1 },
          { id: "2", type: "open_street_map", opacity: 1 }
        ]);
      });

      it("should combine fallback and opacity override", () => {
        const viewerProperty = {
          tiles: [
            { id: "1", type: "default", opacity: 0.5 }, // Migrates to cesium_ion, then falls back to google_satellite
            { id: "2", type: "open_street_map", opacity: 0.7 }
          ]
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: true,
          hasAccessToken: false
        });
        expect(result?.tiles).toEqual([
          {
            id: "1",
            type: "google_satellite",
            cesiumIonAssetId: 2,
            opacity: 1
          },
          { id: "2", type: "open_street_map", opacity: 1 }
        ]);
      });

      it("should not skip opacity override when Google tile already compliant (regression test)", () => {
        // Regression test for bug: when Google tile has opacity=1 (already compliant),
        // needsTileMigration returns false, causing early return that skips opacity
        // override for non-Google tiles
        const viewerProperty = {
          tiles: [
            { id: "1", type: "google_satellite", opacity: 1 }, // Already compliant
            { id: "2", type: "open_street_map", opacity: 0.5 } // Needs override!
          ]
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false
        });

        // Both tiles should have opacity: 1
        expect(result?.tiles).toEqual([
          { id: "1", type: "google_satellite", opacity: 1 },
          { id: "2", type: "open_street_map", opacity: 1 } // ✅ Should be overridden!
        ]);
      });
    });

    describe("needsTileMigration", () => {
      it("should return true for Google tiles with opacity !== 1", () => {
        expect(
          needsTileMigration(
            { type: "google_satellite", opacity: 0.5 },
            { isEE: false, hasAccessToken: false }
          )
        ).toBe(true);

        expect(
          needsTileMigration(
            { type: "google_roadmap", opacity: 0.7 },
            { isEE: false, hasAccessToken: false }
          )
        ).toBe(true);
      });

      it("should return false for Google tiles with opacity === 1", () => {
        expect(
          needsTileMigration(
            { type: "google_satellite", opacity: 1 },
            { isEE: false, hasAccessToken: false }
          )
        ).toBe(false);
      });

      it("should return true for non-Google tiles when Google tiles exist", () => {
        expect(
          needsTileMigration(
            { type: "open_street_map", opacity: 0.5 },
            { isEE: false, hasAccessToken: false },
            true // hasGoogleTiles = true
          )
        ).toBe(true);
      });

      it("should return false for non-Google tiles when no Google tiles exist", () => {
        expect(
          needsTileMigration(
            { type: "open_street_map", opacity: 0.5 },
            { isEE: false, hasAccessToken: false },
            false // hasGoogleTiles = false
          )
        ).toBe(false);
      });

      it("should return true for Google tiles with undefined opacity", () => {
        expect(
          needsTileMigration(
            { type: "google_satellite" },
            { isEE: false, hasAccessToken: false }
          )
        ).toBe(true);
      });
    });
  });

  describe("Street View widget tile extraction and appending", () => {
    describe("extractStreetViewTiles", () => {
      it("should return empty array when widgets is undefined", () => {
        const result = extractStreetViewTiles(undefined);
        expect(result).toEqual([]);
      });

      it("should return empty array when Street View widget not found", () => {
        const widgets = {
          outer: {
            left: { top: { widgets: [] } }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([]);
      });

      it("should return empty array when Street View widget has no property", () => {
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [{ id: "widget-1", extensionId: "streetView" }]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([]);
      });

      it("should extract tile type from Editor Mode (GQL items array format)", () => {
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "widget-1",
                    extensionId: "streetView",
                    property: {
                      items: [
                        {
                          id: "item-1",
                          schemaGroupId: "tiles",
                          fields: [{ fieldId: "tile_type", value: "google_roadmap" }]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([{ id: "reearth-streetview-tile", type: "google_roadmap" }]);
      });

      it("should fallback to google_satellite in Editor Mode when no items", () => {
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "widget-1",
                    extensionId: "streetView",
                    property: {
                      items: []
                    }
                  }
                ]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite" }
        ]);
      });

      it("should extract tile type from Published Mode (object format)", () => {
        const widgets = {
          inner: {
            right: {
              top: {
                widgets: [
                  {
                    id: "widget-1",
                    extensionId: "streetView",
                    property: {
                      tiles: {
                        tile_type: "google_satellite"
                      }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite" }
        ]);
      });

      it("should extract tile type from Published Mode (collection array format)", () => {
        const widgets = {
          inner: {
            right: {
              top: {
                widgets: [
                  {
                    id: "widget-1",
                    extensionId: "streetView",
                    property: {
                      tiles: [
                        {
                          tile_type: "google_roadmap"
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([{ id: "reearth-streetview-tile", type: "google_roadmap" }]);
      });

      it("should fallback to google_satellite in Published Mode when tile_type missing", () => {
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "widget-1",
                    extensionId: "streetView",
                    property: {
                      tiles: {}
                    }
                  }
                ]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite" }
        ]);
      });

      it("should find Street View widget in different zones and areas", () => {
        const widgets = {
          outer: {
            center: {
              middle: {
                widgets: [
                  {
                    id: "other-widget",
                    extensionId: "timeline"
                  }
                ]
              }
            }
          },
          inner: {
            right: {
              bottom: {
                widgets: [
                  {
                    id: "widget-sv",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_satellite" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        expect(result).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite" }
        ]);
      });

      it("should ignore non-string tile_type values in Editor Mode", () => {
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "widget-1",
                    extensionId: "streetView",
                    property: {
                      items: [
                        {
                          id: "item-1",
                          schemaGroupId: "tiles",
                          fields: [{ fieldId: "tile_type", value: 123 }] // Invalid: number
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        };
        const result = extractStreetViewTiles(widgets as any);
        // Should fallback to default
        expect(result).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite" }
        ]);
      });
    });

    describe("migrateViewerPropertyTiles with Street View widget", () => {
      it("should append Street View tile when widget exists", () => {
        const viewerProperty = {
          tiles: [{ id: "1", type: "open_street_map" }]
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_satellite" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        // Street View tile appended, all tiles get opacity: 1 due to Google Maps
        expect(result?.tiles).toEqual([
          { id: "1", type: "open_street_map", opacity: 1 },
          { id: "reearth-streetview-tile", type: "google_satellite", opacity: 1 }
        ]);
      });

      it("should append Street View tile even when tiles array is empty", () => {
        const viewerProperty = {
          tiles: []
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_roadmap" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        expect(result?.tiles).toEqual([
          { id: "reearth-streetview-tile", type: "google_roadmap", opacity: 1 }
        ]);
      });

      it("should NOT append duplicate Street View tile if ID already exists", () => {
        const viewerProperty = {
          tiles: [{ id: "reearth-streetview-tile", type: "google_satellite" }]
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_roadmap" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        // Should not add duplicate, keeps original
        expect(result?.tiles).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite", opacity: 1 }
        ]);
      });

      it("should trigger Google opacity compliance when Street View tile is appended", () => {
        const viewerProperty = {
          tiles: [
            { id: "1", type: "open_street_map", opacity: 0.5 },
            { id: "2", type: "cesium_ion", cesiumIonAssetId: 999, opacity: 0.7 }
          ]
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_satellite" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        // All tiles should have opacity: 1 because Google tile was added
        expect(result?.tiles).toEqual([
          { id: "1", type: "open_street_map", opacity: 1 },
          { id: "2", type: "cesium_ion", cesiumIonAssetId: 999, opacity: 1 },
          { id: "reearth-streetview-tile", type: "google_satellite", opacity: 1 }
        ]);
      });

      it("should NOT skip Street View tile appending due to early-return optimization", () => {
        // Regression test: When no other migration is needed, early-return
        // should NOT prevent Street View tile from being appended
        const viewerProperty = {
          tiles: [{ id: "1", type: "open_street_map", opacity: 1 }] // No migration needed
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_satellite" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        // Should NOT return original early - Street View tile must be appended
        expect(result?.tiles).toEqual([
          { id: "1", type: "open_street_map", opacity: 1 },
          { id: "reearth-streetview-tile", type: "google_satellite", opacity: 1 }
        ]);
      });

      it("should work when viewerProperty has no tiles initially", () => {
        const viewerProperty = {};
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_satellite" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        expect(result?.tiles).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite", opacity: 1 }
        ]);
      });

      it("should handle Editor Mode (GQL) widget property format", () => {
        const viewerProperty = {
          tiles: []
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      items: [
                        {
                          id: "item-1",
                          schemaGroupId: "tiles",
                          fields: [{ fieldId: "tile_type", value: "google_roadmap" }]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        expect(result?.tiles).toEqual([
          { id: "reearth-streetview-tile", type: "google_roadmap", opacity: 1 }
        ]);
      });

      it("should use google_satellite default when Street View widget has no tile selection", () => {
        const viewerProperty = {
          tiles: []
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      items: [] // No tile selection
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: false,
          hasAccessToken: false,
          widgets: widgets as any
        });

        // Should default to google_satellite with opacity: 1
        expect(result?.tiles).toEqual([
          { id: "reearth-streetview-tile", type: "google_satellite", opacity: 1 }
        ]);
      });

      it("should combine Street View tile appending with other migrations", () => {
        const viewerProperty = {
          tiles: [
            { id: "1", type: "default" as const }, // Will migrate to cesium_ion → fallback to google_satellite
            { id: "2", type: "open_street_map", opacity: 0.5 }
          ],
          terrain: { type: "cesium" as const, enabled: true } // Will fallback to reearth_terrain
        };
        const widgets = {
          outer: {
            left: {
              top: {
                widgets: [
                  {
                    id: "sv-widget",
                    extensionId: "streetView",
                    property: {
                      tiles: { tile_type: "google_roadmap" }
                    }
                  }
                ]
              }
            }
          }
        };
        const result = migrateViewerPropertyTiles(viewerProperty, {
          isEE: true,
          hasAccessToken: false,
          widgets: widgets as any
        });

        // All migrations should work together
        expect(result?.tiles).toEqual([
          { id: "1", type: "google_satellite", cesiumIonAssetId: 2, opacity: 1 },
          { id: "2", type: "open_street_map", opacity: 1 },
          { id: "reearth-streetview-tile", type: "google_roadmap", opacity: 1 }
        ]);
        expect(result?.terrain).toEqual({
          type: "reearth_terrain",
          enabled: true,
          normal: true
        });
      });
    });
  });
});
