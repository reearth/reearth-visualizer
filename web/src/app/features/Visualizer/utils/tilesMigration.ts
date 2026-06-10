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
   * Default tile type (applied when tile has no type)
   */
  defaultTileType?: string;
  /**
   * Default terrain type (applied when terrain has no type)
   */
  defaultTerrainType?: string;
  /**
   * Whether Cesium Ion access token is available
   * Used for tiles and terrain fallback when token is required but missing
   */
  hasAccessToken: boolean;
};

/**
 * Mapping of deprecated tile types to cesium_ion with asset IDs
 */
const TILE_TYPE_MIGRATION_MAP: Record<
  string,
  { type: "cesium_ion"; cesiumIonAssetId: number }
> = {
  default: { type: "cesium_ion", cesiumIonAssetId: 2 },
  default_label: { type: "cesium_ion", cesiumIonAssetId: 3 },
  default_road: { type: "cesium_ion", cesiumIonAssetId: 4 },
  black_marble: { type: "cesium_ion", cesiumIonAssetId: 3812 }
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
  tile: { type?: string; cesiumIonAssetId?: number | string; opacity?: number },
  config: TilesMigrationConfig,
  hasGoogleTiles?: boolean
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

  // Check if opacity needs to be set to 1 for Google Maps compliance
  const isGoogleTile = tile.type === "google_satellite" || tile.type === "google_roadmap";
  if ((isGoogleTile || hasGoogleTiles) && tile.opacity !== 1) {
    return true;
  }

  return false;
}

/**
 * Applies migration and fallback to a single tile
 * - Default Application: Apply defaultTileType when no type is set
 * - Migration: Migrate deprecated types to cesium_ion with proper asset IDs (backward compatibility, EE only)
 * - Fallback: If no token available, fallback cesium_ion tiles to alternative EE types (EE only)
 */
function migrateTile<
  T extends { type?: string; cesiumIonAssetId?: number | string; opacity?: number }
>(tile: T, config: TilesMigrationConfig, _hasGoogleTiles?: boolean): T {
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

  let processedTile = tile;

  // Step 1: Migrate deprecated tile types to cesium_ion (MIGRATION - backward compatibility)
  if (tile.type && Object.hasOwn(TILE_TYPE_MIGRATION_MAP, tile.type)) {
    const migration = TILE_TYPE_MIGRATION_MAP[tile.type];
    console.warn(
      `[Tiles Migration] Migrating deprecated tile type "${tile.type}" to "${migration.type}" with asset ID ${migration.cesiumIonAssetId} (backward compatibility, EE environment)`
    );
    processedTile = {
      ...tile,
      type: migration.type,
      cesiumIonAssetId: migration.cesiumIonAssetId
    };
  }

  // Step 2: Fallback cesium_ion tiles to EE types when token is missing (FALLBACK)
  if (processedTile.type === "cesium_ion" && !config.hasAccessToken) {
    const assetId = processedTile.cesiumIonAssetId;
    if (assetId && Object.hasOwn(CESIUM_ION_ASSET_ID_FALLBACK_MAP, String(assetId))) {
      const newType = CESIUM_ION_ASSET_ID_FALLBACK_MAP[String(assetId)];
      console.warn(
        `[Tiles Fallback] Cesium Ion tile (asset ID: ${assetId}) → "${newType}" (Cesium Ion access token required but missing)`
      );
      processedTile = {
        ...processedTile,
        type: newType
      };
    }
  }

  return processedTile;
}

/**
 * Applies default and fallback to terrain property
 * - Default Application: Apply defaultTerrainType when no type is set
 * - Fallback: Use reearth_terrain when cesium requires token but it's missing
 */
function migrateTerrain<T extends { type?: string; enabled?: boolean }>(
  terrain: T | undefined,
  config: TilesMigrationConfig
): T | undefined {
  if (!terrain) return terrain;

  // Apply default terrain type when no type is set
  if (!terrain.type && config.defaultTerrainType) {
    return {
      ...terrain,
      type: config.defaultTerrainType
    };
  }

  // Skip if still no type after default application
  if (!terrain.type) return terrain;

  // Fallback cesium (Cesium World Terrain) to reearth_terrain when token is missing (FALLBACK)
  // Note: cesiumion is intentionally excluded — if the user chose a custom Ion asset
  // and provides no token, terrain simply won't load (expected behaviour).
  if (terrain.type === "cesium" && !config.hasAccessToken) {
    console.warn(
      `[Terrain Fallback] Terrain type "cesium" → "reearth_terrain" (Cesium Ion access token required but missing)`
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
 * 2. Apply defaultTerrainType to terrain without explicit type
 *
 * Migration (backward compatibility, EE only):
 * 3. Migrate deprecated tile types (default, default_label, default_road, black_marble)
 *    to cesium_ion with proper asset IDs
 *
 * Fallback (when requirements not met):
 * 4. If no Cesium Ion token available, fallback cesium_ion tiles to alternative EE types (EE only)
 * 5. Fallback Cesium terrain to reearth_terrain when token missing
 *
 * Google Maps Compliance:
 * 6. Set opacity to 1 for all tiles when Google Maps tiles are present
 *
 * Note: Tiles/terrain without type and without default config will use schema defaults
 *
 * @param viewerProperty - The viewer property containing tiles and terrain
 * @param config - Migration and fallback configuration (includes defaultTileType and defaultTerrainType)
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

  // Check if tiles need migration (first pass: type migration and fallback)
  const tilesNeedProcessing =
    hasTiles && tiles.some((tile) => needsTileMigration(tile, config, false));

  // Check if terrain needs default application or fallback
  const terrainNeedsProcessing =
    hasTerrain &&
    ((!terrain.type && config.defaultTerrainType) ||
      (terrain.type === "cesium" && !config.hasAccessToken));

  // Return original if nothing needs processing
  if (!tilesNeedProcessing && !terrainNeedsProcessing) {
    return viewerProperty;
  }

  const result: ViewerProperty = { ...viewerProperty };

  // First pass: Migrate tiles (type defaults, migrations, and fallbacks)
  if (tilesNeedProcessing && tiles) {
    result.tiles = tiles.map((tile) => migrateTile(tile, config, false));
  }

  // Second pass: Check if any tile is a Google Maps tile after first pass
  const processedTiles = result.tiles || tiles;
  const hasGoogleTiles = processedTiles?.some((tile) =>
    tile.type === "google_satellite" || tile.type === "google_roadmap"
  ) ?? false;

  // Third pass: Apply opacity override if Google tiles are present
  if (hasGoogleTiles && processedTiles) {
    result.tiles = processedTiles.map((tile) => {
      const isGoogleTile = tile.type === "google_satellite" || tile.type === "google_roadmap";
      if ((isGoogleTile || hasGoogleTiles) && tile.opacity !== 1) {
        console.warn(
          `[Tiles Opacity Override] Setting opacity to 1 for ${isGoogleTile ? 'Google Maps tile' : 'tile (Google Maps tiles present)'} (Google Maps Terms of Service compliance)`
        );
        return {
          ...tile,
          opacity: 1
        };
      }
      return tile;
    });
  }

  // Apply terrain default or fallback if needed
  if (terrainNeedsProcessing) {
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
