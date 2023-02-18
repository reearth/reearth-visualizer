import { DataType } from "@reearth/core/mantle";
import { getExtname } from "@reearth/util/path";

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
import type { FeatureComponent, FeatureComponentConfig } from "./utils";

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
  "3dtiles": ["3dtiles"],
  "osm-buildings": ["3dtiles"],
  gpx: "auto",
  shapefile: "auto",
  gtfs: "auto",
  georss: [],
  gml: [],
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

export default function Feature({
  layer,
  isHidden,
  ...props
}: FeatureComponentProps): JSX.Element | null {
  const data = layer.layer.type === "simple" ? layer.layer.data : undefined;
  const ext =
    !data?.type || (data.type as string) === "auto"
      ? (getExtname(data?.url) as DataType)
      : undefined;
  const displayType = data?.type && displayConfig[ext ?? data.type];
  const areAllDisplayTypeNoFeature =
    Array.isArray(displayType) &&
    displayType.every(k => components[k][1].noFeature && !components[k][1].noLayer);

  if (areAllDisplayTypeNoFeature) {
    return (
      <>
        {displayType.map(k => {
          const [C] = components[k] ?? [];
          return (
            <C
              {...props}
              key={`${layer?.id || ""}_${k}`}
              id={layer.id}
              property={pickProperty(k, layer) || layer[k]}
              layer={layer}
              isVisible={layer.layer.visible !== false && !isHidden}
            />
          );
        })}
      </>
    );
  }

  return (
    <>
      {[undefined, ...layer.features].flatMap(f =>
        (Object.keys(components) as (keyof AppearanceTypes)[]).map(k => {
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

          return (
            <C
              {...props}
              key={`${f?.id || ""}_${k}`}
              id={f ? f.id : layer.id}
              property={f ? f[k] : layer[k] || pickProperty(k, layer)}
              geometry={f?.geometry}
              feature={f}
              layer={layer}
              isVisible={layer.layer.visible !== false && !isHidden}
            />
          );
        }),
      )}
    </>
  );
}
