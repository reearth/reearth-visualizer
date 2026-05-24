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
   * Default tile type to apply for tiles without explicit type (migration)
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
  // Check for tiles without type (need default)
  if (!tile.type) return true;

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
 * - Migration: Apply defaults, migrate deprecated types (backward compatibility)
 * - Fallback: Use alternatives when Cesium Ion requires token but it's missing
 */
function migrateTile<
  T extends { type?: string; cesiumIonAssetId?: number | string }
>(tile: T, config: TilesMigrationConfig): T {
  // Apply default tile type for tiles without explicit type (MIGRATION)
  if (!tile.type && config.defaultTileType) {
    console.warn(
      `[Tiles Migration] Applying default tile type "${config.defaultTileType}" to tile without type`
    );
    return {
      ...tile,
      type: config.defaultTileType
    };
  }

  // EE-specific migrations only apply when featureCollection is 'ee'
  if (!config.isEE) return tile;

  // Migrate deprecated tile types (MIGRATION - backward compatibility)
  if (tile.type && tile.type in TILE_TYPE_MIGRATION_MAP) {
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
 * Applies migration and fallback to terrain property
 * - Migration: Apply default type when enabled without type
 * - Fallback: Use reearth_terrain when cesiumion requires token but it's missing
 */
function migrateTerrain<T extends { type?: string; enabled?: boolean }>(
  terrain: T | undefined,
  config: TilesMigrationConfig
): T | undefined {
  if (!terrain) return terrain;

  // Fallback cesiumion terrain when token is missing (FALLBACK)
  if (terrain.type === "cesiumion" && !config.hasAccessToken) {
    console.warn(
      '[Terrain Fallback] Terrain type "cesiumion" → "reearth_terrain" (Cesium Ion access token required but missing)'
    );
    return {
      ...terrain,
      type: "reearth_terrain"
    };
  }

  // Apply default terrain type when enabled without type (MIGRATION)
  if (terrain.enabled && !terrain.type) {
    console.warn(
      '[Terrain Migration] Setting terrain type to "reearth_terrain" (terrain enabled without type)'
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
 * Migration (backward compatibility + defaults):
 * 1. Apply default tile types for tiles without explicit type
 * 2. Migrate deprecated tile types to new types (EE only)
 * 3. Apply default terrain type when enabled without type
 *
 * Fallback (when requirements not met):
 * 4. Fallback Cesium Ion tiles to alternatives when token missing (EE only)
 * 5. Fallback Cesium Ion terrain to reearth_terrain when token missing
 *
 * @param viewerProperty - The viewer property containing tiles and terrain
 * @param config - Migration and fallback configuration
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
    hasTiles &&
    tiles.some((tile) => needsTileMigration(tile, config));

  // Check if terrain needs migration
  const terrainNeedsMigration =
    hasTerrain &&
    ((terrain.type === "cesiumion" && !config.hasAccessToken) ||
      (terrain.enabled && !terrain.type));

  // Return original if nothing needs migration
  if (!tilesNeedProcessing && !terrainNeedsMigration) {
    return viewerProperty;
  }

  const result: ViewerProperty = { ...viewerProperty };

  // Migrate tiles if needed
  if (tilesNeedProcessing && tiles) {
    result.tiles = tiles.map((tile) => migrateTile(tile, config));
  }

  // Migrate terrain if needed
  if (terrainNeedsMigration) {
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
