import { Cartesian3, Entity } from "cesium";
import { isEqual } from "lodash-es";
import { useEffect, useMemo, useRef } from "react";
import { CesiumComponentRef, PolylineGraphics } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { Coordinates, toColor } from "@reearth/beta/utils/value";

import type { PolylineAppearance } from "../../..";
import { classificationType, shadowMode } from "../../common";
import { useContext } from "../context";
import {
  EntityExt,
  toDistanceDisplayCondition,
  toTimeInterval,
  type FeatureComponentConfig,
  type FeatureProps,
  getTag,
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

  const { requestRender } = useContext();

  const {
    clampToGround,
    strokeColor,
    strokeWidth = 1,
    shadows,
    classificationType: ct,
    hideIndicator,
  } = property ?? {};

  const positions = useCustomCompareMemo(
    () => coordinates?.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2])),
    [coordinates ?? []],
    isEqual,
  );

  const entityRef = useRef<CesiumComponentRef<Entity>>(null);
  const tag = getTag(entityRef.current?.cesiumElement);

  const material = useMemo(
    () =>
      tag?.isFeatureSelected && typeof layer?.["polyline"]?.selectedFeatureColor === "string"
        ? toColor(layer["polyline"]?.selectedFeatureColor)
        : toColor(strokeColor),
    [strokeColor, layer, tag?.isFeatureSelected],
  );
  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);
  const distanceDisplayCondition = useMemo(
    () => toDistanceDisplayCondition(property?.near, property?.far),
    [property?.near, property?.far],
  );

  useEffect(() => {
    requestRender?.();
  });

  return !isVisible || !coordinates || !show ? null : (
    <EntityExt
      id={id}
      layerId={layer?.id}
      featureId={feature?.id}
      ref={entityRef}
      availability={availability}
      properties={feature?.properties}
      hideIndicator={hideIndicator}>
      <PolylineGraphics
        positions={positions}
        width={strokeWidth}
        material={material}
        clampToGround={clampToGround}
        shadows={shadowMode(shadows)}
        distanceDisplayCondition={distanceDisplayCondition}
        classificationType={classificationType(ct)}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
