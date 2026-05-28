import type { Layer } from "@reearth/core";

/**
 * Configuration for layers fallback
 */
export type LayersMigrationConfig = {
  /**
   * Whether the current feature collection is "ee"
   */
  isEE: boolean;
  /**
   * Whether Cesium Ion access token is available
   * Used for fallback when Cesium Ion assets require token but it's missing
   */
  hasAccessToken: boolean;
};

/**
 * Options for layer migration
 */
export type LayerMigrationOptions = {
  /**
   * Skip the layer type check (useful for plugin API partial overrides)
   */
  skipTypeCheck?: boolean;
};

/**
 * Checks if a layer needs migration/processing
 */
function needsLayerMigration(
  layer: Layer,
  config: LayersMigrationConfig,
  options?: LayerMigrationOptions
): boolean {
  // Only LayerSimple can have data (unless skipTypeCheck is true)
  if (!options?.skipTypeCheck && layer.type !== "simple") return false;

  // Check if layer has data property (LayerGroup doesn't have data)
  const layerData = "data" in layer ? layer.data : undefined;
  if (!layerData) return false;

  // Check for osm-buildings without token
  if (
    layerData.type === "osm-buildings" &&
    !config.hasAccessToken
  ) {
    return true;
  }

  // Check for google-photorealistic provider fallback (EE only)
  if (
    config.isEE &&
    layerData.type === "google-photorealistic" &&
    (!layerData.provider ||
      (layerData.provider === "cesium-ion" && !config.hasAccessToken))
  ) {
    return true;
  }

  return false;
}

/**
 * Applies fallback to a single layer when requirements not met
 * - OSM Buildings: Use reearth-buildings when Cesium Ion token missing
 * - Google Photorealistic: Use reearth provider when token missing or no provider
 */
function migrateLayer(
  layer: Layer,
  config: LayersMigrationConfig,
  options?: LayerMigrationOptions
): Layer {
  // Only process simple layers with data (unless skipTypeCheck is true)
  if (!options?.skipTypeCheck && layer.type !== "simple") return layer;

  // Check if layer has data property (LayerGroup doesn't have data)
  const layerData = "data" in layer ? layer.data : undefined;
  if (!layerData) return layer;

  // Fallback osm-buildings when token is missing (FALLBACK)
  if (layerData.type === "osm-buildings" && !config.hasAccessToken) {
    console.warn(
      `[Layers Fallback] Layer "${layer.id}": Data type "osm-buildings" → "reearth-buildings" (Cesium Ion access token required but missing)`
    );
    return {
      ...layer,
      data: {
        ...layerData,
        type: "reearth-buildings"
      }
    } as Layer;
  }

  // Fallback google-photorealistic provider when requirements not met (FALLBACK - EE only)
  if (
    config.isEE &&
    layerData.type === "google-photorealistic" &&
    (!layerData.provider ||
      (layerData.provider === "cesium-ion" && !config.hasAccessToken))
  ) {
    const reason = !layerData.provider
      ? "provider not specified"
      : "Cesium Ion access token required but missing";
    console.warn(
      `[Layers Fallback] Layer "${layer.id}": Setting google-photorealistic provider to "reearth" (${reason}, EE environment)`
    );
    return {
      ...layer,
      data: {
        ...layerData,
        provider: "reearth"
      }
    } as Layer;
  }

  return layer;
}

/**
 * Recursively migrates layers including nested group children
 */
function migrateLayerRecursive(
  layer: Layer,
  config: LayersMigrationConfig,
  options?: LayerMigrationOptions
): Layer {
  // Migrate the current layer
  const migratedLayer = migrateLayer(layer, config, options);

  // If it's a group, recursively migrate children
  if (migratedLayer.type === "group" && migratedLayer.children && migratedLayer.children.length > 0) {
    return {
      ...migratedLayer,
      children: migratedLayer.children.map(child =>
        migrateLayerRecursive(child, config, options)
      )
    };
  }

  return migratedLayer;
}

/**
 * Applies fallback logic to layers array when requirements not met
 *
 * Fallback (when requirements not met):
 * 1. OSM Buildings: fallback to reearth-buildings when Cesium Ion token missing
 * 2. Google Photorealistic (EE only): fallback provider to reearth when:
 *    - No provider specified, OR
 *    - Provider is cesium-ion but token is missing
 * 3. Recursively processes layer groups
 *
 * @param layers - Array of layers to process
 * @param config - Fallback configuration
 * @param options - Migration options
 * @returns Processed layers array or original if no fallback needed
 */
export function migrateLayers(
  layers: Layer[] | undefined,
  config: LayersMigrationConfig,
  options?: LayerMigrationOptions
): Layer[] | undefined {
  if (!layers || layers.length === 0) return layers;

  // Check if any layer (or nested layer) needs migration
  const needsProcessing = layers.some(layer =>
    checkLayerTreeNeedsMigration(layer, config, options)
  );

  if (!needsProcessing) return layers;

  // Migrate all layers recursively
  return layers.map(layer => migrateLayerRecursive(layer, config, options));
}

/**
 * Recursively checks if a layer or any of its children need migration
 */
function checkLayerTreeNeedsMigration(
  layer: Layer,
  config: LayersMigrationConfig,
  options?: LayerMigrationOptions
): boolean {
  // Check current layer
  if (needsLayerMigration(layer, config, options)) return true;

  // Check children if it's a group
  if (layer.type === "group" && layer.children) {
    return layer.children.some(child =>
      checkLayerTreeNeedsMigration(child, config, options)
    );
  }

  return false;
}

/**
 * Export migrateLayer for use in plugin API
 */
export { migrateLayer };

/**
 * Export functions for testing purposes
 */
export const __testing__ = {
  needsLayerMigration,
  migrateLayer,
  migrateLayerRecursive,
  checkLayerTreeNeedsMigration
};
