import type { Layer, LayerSimple } from "@reearth/core";

import type { ViewerProperty } from "@reearth/app/features/Editor/Visualizer/type";

const CESIUM_ION_URL_PATTERN = "ion.cesium.com";

const CESIUM_ION_LEGACY_TILE_TYPES = new Set([
  "default",
  "default_road",
  "default_label",
  "black_marble",
]);

function isIonUrl(url?: string | null): boolean {
  return !!url && url.includes(CESIUM_ION_URL_PATTERN);
}

function tileUsesIon(tile: { type?: string }): boolean {
  if (!tile.type) return false;
  if (tile.type.startsWith("cesium_ion")) return true;
  if (CESIUM_ION_LEGACY_TILE_TYPES.has(tile.type)) return true;
  return false;
}

function terrainUsesIon(viewerProperty?: ViewerProperty): boolean {
  const terrain = viewerProperty?.terrain;
  if (!terrain?.enabled) return false;
  if (terrain.type === "cesium" || terrain.type === "cesiumion") return true;
  // URL-based Ion terrain
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ionUrl = (viewerProperty as any)?.assets?.cesium?.terrain?.ionUrl;
  if (isIonUrl(ionUrl)) return true;
  return false;
}

function layerUsesIon(layer: LayerSimple): boolean {
  const data = layer.data;
  if (!data) return false;
  // If still osm-buildings after migration, a valid Ion token exists
  if (data.type === "osm-buildings") return true;
  if (data.type === "google-photorealistic") {
    // provider="reearth" means migrated away from Ion or explicitly using reearth
    if (data.provider === "reearth") return false;
    // Has a Google Maps API key and not forcing cesium-ion → uses Google API, not Ion
    if (data.serviceTokens?.googleMapApiKey && data.provider !== "cesium-ion") return false;
    return true;
  }
  if (data.type === "3dtiles" && isIonUrl(data.url)) return true;
  return false;
}

function anyLayerUsesIon(layer: Layer): boolean {
  if (layer.type === "group") {
    return layer.children.some(anyLayerUsesIon);
  }
  return layerUsesIon(layer);
}

export function computeHasCesiumIonAsset(
  viewerProperty?: ViewerProperty,
  layers?: Layer[],
): boolean {
  if (viewerProperty?.tiles?.some(tileUsesIon)) return true;
  if (terrainUsesIon(viewerProperty)) return true;
  if (layers?.some(anyLayerUsesIon)) return true;
  return false;
}
