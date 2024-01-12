import LRUCache from "lru-cache";
import { useMemo } from "react";

import { ComputedFeature, DataType, guessType } from "@reearth/beta/lib/core/mantle";

import type { AppearanceTypes, FeatureComponentProps, ComputedLayer } from "../..";

import Box, { config as boxConfig } from "./Box";
import Ellipse, { config as ellipseConfig } from "./Ellipse";
import Ellipsoid, { config as ellipsoidConfig } from "./Ellipsoid";
import Frustum, { config as frustumConfig } from "./Frustum";
import HeatMap, { config as heatMapConfig } from "./HeatMap";
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

const NON_RENDERABLE_APPEARANCE = ["transition"] satisfies (keyof AppearanceTypes)[];
const isRenderableAppearance = (
  k: keyof AppearanceTypes,
): k is Exclude<keyof AppearanceTypes, (typeof NON_RENDERABLE_APPEARANCE)[number]> =>
  !(NON_RENDERABLE_APPEARANCE as string[]).includes(k);

const components: Record<
  Exclude<keyof AppearanceTypes, (typeof NON_RENDERABLE_APPEARANCE)[number]>,
  [FeatureComponent, FeatureComponentConfig]
> = {
  marker: [Marker, markerConfig],
  polyline: [Polyline, polylineConfig],
  polygon: [Polygon, polygonConfig],
  ellipsoid: [Ellipsoid, ellipsoidConfig],
  ellipse: [Ellipse, ellipseConfig],
  model: [Model, modelConfig],
  "3dtiles": [Tileset, tilesetConfig],
  box: [Box, boxConfig],
  photooverlay: [PhotoOverlay, photoOverlayConfig],
  resource: [Resource, resourceConfig],
  raster: [Raster, rasterConfig],
  heatMap: [HeatMap, heatMapConfig],
  frustum: [Frustum, frustumConfig],
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
  "google-photorealistic": ["3dtiles"],
  gpx: "auto",
  shapefile: "auto",
  gtfs: "auto",
  georss: [],
  gml: [],
  gltf: ["model"],
  tiles: ["raster"],
  heatMap: ["heatMap"],
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
  if (layer.features?.length > FEATURE_DELEGATE_THRESHOLD || data?.geojson?.useAsResource) {
    displayType = ["resource"];
  }
  const areAllDisplayTypeNoFeature =
    Array.isArray(displayType) &&
    displayType.every(k => components[k][1].noFeature && !components[k][1].noLayer);
  const useTransition = !!layer?.transition?.useTransition;
  const cacheable = !data?.updateInterval && !useTransition;
  const urlMD5 = useMemo(() => (data?.url ? generateIDWithMD5(data.url) : ""), [data?.url]);

  const renderComponent = (k: keyof AppearanceTypes, f?: ComputedFeature): JSX.Element | null => {
    if (!isRenderableAppearance(k)) return null;

    const useSceneSphericalHarmonicCoefficients =
      !!props.sceneProperty?.light?.sphericalHarmonicCoefficients;
    const useSceneSpecularEnvironmentMaps = !!props.sceneProperty?.light?.specularEnvironmentMaps;

    const isVisible = layer.layer.visible !== false && !isHidden;

    const componentId =
      urlMD5 +
      generateIDWithMD5(
        `${layer.id}_${
          f?.id ?? ""
        }_${k}_${isVisible}_${useSceneSphericalHarmonicCoefficients}_${useSceneSpecularEnvironmentMaps}_${
          JSON.stringify(f?.[k]) ?? ""
        }_${JSON.stringify(layer.transition) ?? ""}`,
      );

    if (cacheable) {
      const cachedComponent = CACHED_COMPONENTS.get(componentId);
      if (cacheable && cachedComponent) {
        return cachedComponent;
      }
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
          key={!useTransition ? componentId : undefined}
          id={!useTransition ? componentId : f?.id ?? layer.id}
          property={f ? f[k] : layer[k] || pickProperty(k, layer)}
          geometry={f?.geometry}
          feature={f}
          layer={layer}
          isVisible={isVisible}
        />
      );

      // Cache the component output
      if (cacheable) {
        CACHED_COMPONENTS.set(componentId, component);
      }

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
          // NOTE: IBL for 3dtiles is not updated unless Tileset feature component is re-created.
          const useSceneSphericalHarmonicCoefficients =
            !!props.sceneProperty?.light?.sphericalHarmonicCoefficients;
          const useSceneSpecularEnvironmentMaps =
            !!props.sceneProperty?.light?.specularEnvironmentMaps;
          const use3dtilesSphericalHarmonicCoefficients =
            layer?.layer?.type === "simple" &&
            !!layer?.layer?.["3dtiles"]?.sphericalHarmonicCoefficients;
          const use3dtilesSpecularEnvironmentMaps =
            layer?.layer?.type === "simple" && !!layer?.layer?.["3dtiles"]?.specularEnvironmentMaps;

          // "noFeature" component should be recreated when the following value is changed.
          // data.url, isVisible
          const key =
            urlMD5 +
            generateIDWithMD5(
              `${
                layer?.id || ""
              }_${k}_${isVisible}_${useSceneSphericalHarmonicCoefficients}_${useSceneSpecularEnvironmentMaps}_${use3dtilesSphericalHarmonicCoefficients}}_${use3dtilesSpecularEnvironmentMaps}`,
            );

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
  }, [areAllDisplayTypeNoFeature, displayType, layer, isHidden, urlMD5, props]);

  return (
    <>
      {cachedNoFeatureComponents ||
        [undefined, ...layer.features].flatMap(f =>
          (Object.keys(components) as (keyof AppearanceTypes)[]).map(k => renderComponent(k, f)),
        )}
    </>
  );
}
