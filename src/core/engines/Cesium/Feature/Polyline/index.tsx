import { Cartesian3 } from "cesium";
import { isEqual } from "lodash-es";
import { useMemo } from "react";
import { PolylineGraphics } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { Coordinates, toColor } from "@reearth/util/value";

import type { PolylineAppearance } from "../../..";
import { shadowMode } from "../../common";
import {
  EntityExt,
  toDistanceDisplayCondition,
  toTimeInterval,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

export type Props = FeatureProps<Property>;

export type Property = PolylineAppearance & {
  coordinates?: Coordinates;
};

export default function Polyline({ id, isVisible, property, geometry, layer, feature }: Props) {
  const { show = true } = property || {};
  const coordinates = useMemo(
    () =>
      geometry?.type === "LineString"
        ? geometry.coordinates
        : property?.coordinates
        ? property.coordinates.map(p => [p.lng, p.lat, p.height])
        : undefined,
    [geometry?.coordinates, geometry?.type, property?.coordinates],
  );

  const { clampToGround, strokeColor, strokeWidth = 1, shadows } = property ?? {};

  const positions = useCustomCompareMemo(
    () => coordinates?.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2])),
    [coordinates ?? []],
    isEqual,
  );
  const material = useMemo(() => toColor(strokeColor), [strokeColor]);
  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);
  const distanceDisplayCondition = useMemo(
    () => toDistanceDisplayCondition(property?.near, property?.far),
    [property?.near, property?.far],
  );

  return !isVisible || !coordinates || !show ? null : (
    <EntityExt
      id={id}
      layerId={layer?.id}
      featureId={feature?.id}
      availability={availability}
      properties={feature?.properties}>
      <PolylineGraphics
        positions={positions}
        width={strokeWidth}
        material={material}
        clampToGround={clampToGround}
        shadows={shadowMode(shadows)}
        distanceDisplayCondition={distanceDisplayCondition}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
