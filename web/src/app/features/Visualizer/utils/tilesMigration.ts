import { ViewerProperty } from "@reearth/app/features/Editor/Visualizer/type";

/**
 * Configuration for viewer property migration and fallback (tiles and terrain)
 */
export type TilesMigrationConfig = {
  /**
   * Whether the current feature collection is "ee"
   */
  isEE: boolean;
  /**
   * Default tile type (used for UI display only, not for migration)
   */
  defaultTileType?: string;
  /**
   * Whether Cesium Ion access token is available
   * Used for tiles and terrain fallback when token is required but missing
   */
  hasAccessToken: boolean;
};

/**
 * Mapping of deprecated tile types to EE tile types
 */
const TILE_TYPE_MIGRATION_MAP: Record<string, string> = {
  default: "google_satellite",
  default_label: "google_satellite",
  default_road: "google_roadmap",
  black_marble: "nasa_black_marble"
};

/**
 * Mapping of Cesium Ion asset IDs to EE tile types (fallback when no token provided)
 */
const CESIUM_ION_ASSET_ID_FALLBACK_MAP: Record<string, string> = {
  "2": "google_satellite",
  "3": "google_satellite",
  "4": "google_roadmap",
  "3812": "nasa_black_marble"
};

/**
 * Checks if a tile needs migration/processing
 */
function needsTileMigration(
  tile: { type?: string; cesiumIonAssetId?: number | string },
  config: TilesMigrationConfig
): boolean {
  // Check if tile needs default type application
  if (!tile.type && config.defaultTileType) return true;

  // Skip tiles without type - they will use schema defaults
  if (!tile.type) return false;

  // Check for deprecated tile types (EE only)
  if (config.isEE && tile.type in TILE_TYPE_MIGRATION_MAP) return true;

  // Check for cesium_ion tiles without token that need fallback (EE only)
  if (
    config.isEE &&
    tile.type === "cesium_ion" &&
    !config.hasAccessToken &&
    tile.cesiumIonAssetId &&
    String(tile.cesiumIonAssetId) in CESIUM_ION_ASSET_ID_FALLBACK_MAP
  ) {
    return true;
  }

  return false;
}

/**
 * Applies migration and fallback to a single tile
 * - Default Application: Apply defaultTileType when no type is set
 * - Migration: Migrate deprecated types (backward compatibility, EE only)
 * - Fallback: Use alternatives when Cesium Ion requires token but it's missing (EE only)
 */
function migrateTile<
  T extends { type?: string; cesiumIonAssetId?: number | string }
>(tile: T, config: TilesMigrationConfig): T {
  // Apply default tile type when no type is set
  if (!tile.type && config.defaultTileType) {
    return {
      ...tile,
      type: config.defaultTileType
    };
  }

  // Skip tiles without type - they will use schema defaults
  if (!tile.type) return tile;

  // EE-specific migrations only apply when featureCollection is 'ee'
  if (!config.isEE) return tile;

  // Migrate deprecated tile types (MIGRATION - backward compatibility)
  if (tile.type in TILE_TYPE_MIGRATION_MAP) {
    const newType = TILE_TYPE_MIGRATION_MAP[tile.type];
    console.warn(
      `[Tiles Migration] Migrating deprecated tile type "${tile.type}" to "${newType}" (backward compatibility, EE environment)`
    );
    return {
      ...tile,
      type: newType
    };
  }

  // Fallback cesium_ion tiles to EE types when token is missing (FALLBACK)
  if (tile.type === "cesium_ion" && !config.hasAccessToken) {
    const assetId = tile.cesiumIonAssetId;
    if (assetId && String(assetId) in CESIUM_ION_ASSET_ID_FALLBACK_MAP) {
      const newType = CESIUM_ION_ASSET_ID_FALLBACK_MAP[String(assetId)];
      console.warn(
        `[Tiles Fallback] Cesium Ion tile (asset ID: ${assetId}) → "${newType}" (Cesium Ion access token required but missing)`
      );
      return {
        ...tile,
        type: newType
      };
    }
  }

  return tile;
}

/**
 * Applies fallback to terrain property
 * - Fallback: Use reearth_terrain when cesium requires token but it's missing
 */
function migrateTerrain<T extends { type?: string; enabled?: boolean }>(
  terrain: T | undefined,
  config: TilesMigrationConfig
): T | undefined {
  if (!terrain) return terrain;

  // Fallback cesium (Cesium World Terrain) to reearth_terrain when token is missing (FALLBACK)
  // Also covers undefined type: the manifest defaultValue "reearth_terrain" is only a UI hint and is
  // never persisted until the user explicitly changes the field, so a brand-new project will have
  // terrain.type === undefined here, which the core would silently default to "cesium" (requiring a
  // token). Treating undefined the same as "cesium" closes that gap.
  // Note: cesiumion is intentionally excluded — if the user chose a custom Ion asset
  // and provides no token, terrain simply won't load (expected behaviour).
  if ((!terrain.type || terrain.type === "cesium") && terrain.enabled && !config.hasAccessToken) {
    console.warn(
      `[Terrain Fallback] Terrain type "${terrain.type ?? "undefined (default cesium)"}" → "reearth_terrain" (Cesium Ion access token required but missing)`
    );
    return {
      ...terrain,
      type: "reearth_terrain"
    };
  }

  return terrain;
}

/**
 * Applies migration (backward compatibility) and fallback logic to viewer property
 *
 * Default Application:
 * 1. Apply defaultTileType to tiles without explicit type
 *
 * Migration (backward compatibility):
 * 2. Migrate deprecated tile types to new types (EE only)
 *
 * Fallback (when requirements not met):
 * 3. Fallback Cesium Ion tiles to alternatives when token missing (EE only)
 * 4. Fallback Cesium terrain to reearth_terrain when token missing
 *
 * Note: Tiles without type and without defaultTileType config will use schema defaults
 *
 * @param viewerProperty - The viewer property containing tiles and terrain
 * @param config - Migration and fallback configuration (includes defaultTileType)
 * @returns Processed viewer property or original if no processing needed
 */
export function migrateViewerPropertyTiles(
  viewerProperty: ViewerProperty | undefined,
  config: TilesMigrationConfig
): ViewerProperty | undefined {
  if (!viewerProperty) return viewerProperty;

  const { tiles, terrain } = viewerProperty;
  const hasTiles = tiles && tiles.length > 0;
  const hasTerrain = terrain;

  // Check if tiles need migration
  const tilesNeedProcessing =
    hasTiles && tiles.some((tile) => needsTileMigration(tile, config));

  // Check if terrain needs fallback
  // Also handles undefined type: core defaults undefined to "cesium" (requires token)
  const terrainNeedsFallback =
    hasTerrain &&
    (!terrain.type || terrain.type === "cesium") &&
    !!terrain.enabled &&
    !config.hasAccessToken;

  // Return original if nothing needs processing
  if (!tilesNeedProcessing && !terrainNeedsFallback) {
    return viewerProperty;
  }

  const result: ViewerProperty = { ...viewerProperty };

  // Migrate tiles if needed
  if (tilesNeedProcessing && tiles) {
    result.tiles = tiles.map((tile) => migrateTile(tile, config));
  }

  // Apply terrain fallback if needed
  if (terrainNeedsFallback) {
    result.terrain = migrateTerrain(terrain, config);
  }

  return result;
}

/**
 * Export migration maps and functions for testing purposes
 */
export const __testing__ = {
  TILE_TYPE_MIGRATION_MAP,
  CESIUM_ION_ASSET_ID_FALLBACK_MAP,
  needsTileMigration,
  migrateTile,
  migrateTerrain
};
