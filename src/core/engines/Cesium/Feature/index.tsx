import type { AppearanceTypes, FeatureComponentProps } from "../..";

import Box, { config as boxConfig } from "./Box";
import Ellipsoid, { config as ellipsoidConfig } from "./Ellipsoid";
import Marker, { config as markerConfig } from "./Marker";
import Model, { config as modelConfig } from "./Model";
import PhotoOverlay, { config as photoOverlayConfig } from "./PhotoOverlay";
import Polygon, { config as polygonConfig } from "./Polygon";
import Polyline, { config as polylineConfig } from "./Polyline";
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
  legacy_resource: [Resource, resourceConfig],
};

export default function Feature({
  layer,
  isHidden,
  ...props
}: FeatureComponentProps): JSX.Element | null {
  return (
    <>
      {[undefined, ...layer.features].flatMap(f =>
        (Object.keys(components) as (keyof AppearanceTypes)[]).map(k => {
          const [C, config] = components[k] ?? [];
          if (
            !C ||
            (f && !f[k]) ||
            !layer[k] ||
            (config.noLayer && !f) ||
            (config.noFeature && f)
          ) {
            return null;
          }

          return (
            <C
              {...props}
              key={`${f?.id || ""}_${k}`}
              id={f ? f.id : layer.id}
              property={f ? f[k] : layer[k]}
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
