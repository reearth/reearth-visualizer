import LRUCache from "lru-cache";
import { useMemo } from "react";

import { ComputedFeature, DataType, guessType } from "@reearth/core/mantle";

import type { AppearanceTypes, FeatureComponentProps, ComputedLayer } from "../..";

import Box, { config as boxConfig } from "./Box";
import Ellipsoid, { config as ellipsoidConfig } from "./Ellipsoid";
import Marker, { config as markerConfig } from "./Marker";
import Model, { config as modelConfig } from "./Model";
import PhotoOverlay, { config as photoOverlayConfig } from "./PhotoOverlay";
import Polygon, { config as polygonConfig } from "./Polygon";
import Polyline, { config as polylineConfig } from "./Polyline";
import Raster, { config as rasterConfig } from "./Raster";
import Resource, { config as resourceConfig } from "./Resource";
import Tileset, { config as tilesetConfig } from "./Tileset";
import {
  extractSimpleLayerData,
  FeatureComponent,
  FeatureComponentConfig,
  generateIDWithMD5,
} from "./utils";

export * from "./utils";
export { context, type Context } from "./context";
export { getTag } from "./utils";

const components: Record<keyof AppearanceTypes, [FeatureComponent, FeatureComponentConfig]> = {
  marker: [Marker, markerConfig],
  polyline: [Polyline, polylineConfig],
  polygon: [Polygon, polygonConfig],
  ellipsoid: [Ellipsoid, ellipsoidConfig],
  model: [Model, modelConfig],
  "3dtiles": [Tileset, tilesetConfig],
  box: [Box, boxConfig],
  photooverlay: [PhotoOverlay, photoOverlayConfig],
  resource: [Resource, resourceConfig],
  raster: [Raster, rasterConfig],
};

// This indicates what component should render for file extension.
const displayConfig: Record<DataType, (keyof typeof components)[] | "auto"> = {
  geojson: "auto",
  csv: "auto",
  czml: ["resource"],
  kml: ["resource"],
  wms: ["raster"],
  mvt: ["raster"],
  tms: ["raster"],
  "3dtiles": ["3dtiles"],
  "osm-buildings": ["3dtiles"],
  gpx: "auto",
  shapefile: "auto",
  gtfs: "auto",
  georss: [],
  gml: [],
  gltf: ["model"],
  tiles: ["raster"],
};

// Some layer that is delegated data is not computed when layer is updated.
// Feature's property of delegated data type is calculated when feature is loaded.
// So in case of delegated data type, to attach property to layer, we need to use normal property before calculated.
const PICKABLE_APPEARANCE: (keyof AppearanceTypes)[] = ["raster", "3dtiles"];
const pickProperty = (k: keyof AppearanceTypes, layer: ComputedLayer) => {
  if (!PICKABLE_APPEARANCE.includes(k)) {
    return;
  }
  if (layer.layer.type !== "simple") {
    return;
  }
  return layer.layer[k];
};

const CACHED_COMPONENTS = new LRUCache<string, JSX.Element>({ max: 10000 });
const FEATURE_DELEGATE_THRESHOLD = 6000;

export default function Feature({
  layer,
  isHidden,
  ...props
}: FeatureComponentProps): JSX.Element | null {
  const data = extractSimpleLayerData(layer);
  const ext = !data?.type || (data.type as string) === "auto" ? guessType(data?.url) : undefined;
  let displayType = data?.type && displayConfig[ext ?? data.type];
  if (layer.features?.length > FEATURE_DELEGATE_THRESHOLD) {
    displayType = ["resource"];
  }
  const areAllDisplayTypeNoFeature =
    Array.isArray(displayType) &&
    displayType.every(k => components[k][1].noFeature && !components[k][1].noLayer);

  const cachedRenderComponent = (
    k: keyof AppearanceTypes,
    f?: ComputedFeature,
  ): JSX.Element | null => {
    const componentId = `${layer.id}_${f?.id ?? ""}_${k}_${JSON.stringify(f?.[k]) ?? ""}`;

    // Check if the component output is already cached
    const cachedComponent = CACHED_COMPONENTS.get(componentId);
    if (cachedComponent) {
      return cachedComponent;
    }

    try {
      const [C, config] = components[k] ?? [];
      if (!C || (f && !f[k]) || (config.noLayer && !f) || (config.noFeature && f)) {
        return null;
      }

      if (
        (Array.isArray(displayType) && !displayType.includes(k)) ||
        (!Array.isArray(displayType) && displayType !== "auto")
      ) {
        return null;
      }

      // Skip using the Resource component if the data layer type is geojson and it is considered as active
      if (data?.type === "geojson" && displayType === "auto" && k === "resource") {
        return null;
      }

      const component = (
        <C
          {...props}
          key={componentId}
          id={componentId}
          property={f ? f[k] : layer[k] || pickProperty(k, layer)}
          geometry={f?.geometry}
          feature={f}
          layer={layer}
          isVisible={layer.layer.visible !== false && !isHidden}
        />
      );

      // Cache the component output
      CACHED_COMPONENTS.set(componentId, component);

      return component;
    } catch (e) {
      // Log any errors that occur during rendering
      console.error(`Error rendering component ${componentId}`, e);
      return null;
    }
  };

  const cachedNoFeatureComponents = useMemo(() => {
    if (!areAllDisplayTypeNoFeature || !displayType || !Array.isArray(displayType)) {
      return null;
    }

    return (
      <>
        {displayType.map(k => {
          const [C] = components[k] ?? [];
          const isVisible = layer.layer.visible !== false && !isHidden;

          // "noFeature" component should be recreated when the following value is changed.
          // data.url, isVisible
          const key = generateIDWithMD5(`${layer?.id || ""}_${k}_${data?.url}_${isVisible}`);

          return (
            <C
              {...props}
              key={key}
              id={`${layer.id}_${k}`}
              property={pickProperty(k, layer) || layer[k]}
              layer={layer}
              isVisible={isVisible}
            />
          );
        })}
      </>
    );
  }, [areAllDisplayTypeNoFeature, displayType, layer, isHidden, data, props]);

  return (
    <>
      {cachedNoFeatureComponents ||
        [undefined, ...layer.features].flatMap(f =>
          (Object.keys(components) as (keyof AppearanceTypes)[]).map(k =>
            cachedRenderComponent(k, f),
          ),
        )}
    </>
  );
}
