/* eslint-disable react-hooks/exhaustive-deps */
import { Cartesian3, Entity as CesiumEntity, PolygonHierarchy } from "cesium";
import { isEqual } from "lodash-es";
import { useEffect, useMemo, useRef } from "react";
import { CesiumComponentRef, Entity, PolygonGraphics, PolylineGraphics } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { Polygon as PolygonValue, toColor } from "@reearth/beta/utils/value";

import type { PolygonAppearance } from "../../..";
import { classificationType, heightReference, shadowMode } from "../../common";
import { useContext } from "../context";
import {
  EntityExt,
  toDistanceDisplayCondition,
  toTimeInterval,
  type FeatureComponentConfig,
  type FeatureProps,
  getTag,
} from "../utils";

export type Props = FeatureProps<Property> & {
  disableWorkaround?: boolean;
};

export type Property = PolygonAppearance & {
  polygon?: PolygonValue;
};

export default function Polygon({
  id,
  isVisible,
  property,
  geometry,
  layer,
  feature,
  disableWorkaround,
}: Props) {
  const coordiantes = useMemo(
    () =>
      geometry?.type === "Polygon"
        ? geometry.coordinates
        : property?.polygon
        ? property.polygon.map(p => p.map(q => [q.lng, q.lat, q.height]))
        : undefined,
    [geometry?.coordinates, geometry?.type, property?.polygon],
  );

  const { requestRender } = useContext();

  const {
    show = true,
    fill = true,
    stroke,
    fillColor,
    strokeColor,
    strokeWidth = 1,
    heightReference: hr,
    shadows,
    extrudedHeight,
    classificationType: ct,
    hideIndicator,
  } = property ?? {};

  const hierarchy = useCustomCompareMemo(
    () =>
      coordiantes?.[0]
        ? new PolygonHierarchy(
            coordiantes[0].map(c => Cartesian3.fromDegrees(c[0], c[1], c[2] ?? 0)),
            coordiantes
              .slice(1)
              .map(
                p =>
                  new PolygonHierarchy(p.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2] ?? 0))),
              ),
          )
        : undefined,
    [coordiantes ?? []],
    isEqual,
  );

  const strokes = useMemo(
    () =>
      coordiantes && stroke && !disableWorkaround
        ? coordiantes.flatMap(hole => [
            // bottom
            hole.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2] ?? 0)),
            ...(extrudedHeight
              ? [
                  // top
                  hole.map(c => Cartesian3.fromDegrees(c[0], c[1], extrudedHeight)),
                  // vertical
                  ...hole
                    .slice(0, -1)
                    .map(c => [
                      Cartesian3.fromDegrees(c[0], c[1], 0),
                      Cartesian3.fromDegrees(c[0], c[1], extrudedHeight),
                    ]),
                ]
              : []),
          ])
        : [],
    [coordiantes, stroke, disableWorkaround],
  );

  const memoStrokeColor = useMemo(
    () => (stroke ? toColor(strokeColor) : undefined),
    [stroke, strokeColor],
  );

  const entityRef = useRef<CesiumComponentRef<CesiumEntity>>(null);
  const tag = getTag(entityRef.current?.cesiumElement);

  const memoFillColor = useMemo(
    () =>
      fill
        ? tag?.isFeatureSelected && typeof layer?.["polygon"]?.selectedFeatureColor === "string"
          ? toColor(layer["polygon"]?.selectedFeatureColor)
          : toColor(fillColor)
        : undefined,
    [fill, fillColor, layer?.id, feature?.id, tag?.isFeatureSelected],
  );

  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);
  const distanceDisplayCondition = useMemo(
    () => toDistanceDisplayCondition(property?.near, property?.far),
    [property?.near, property?.far],
  );

  const extrudedHeightProperty: { extrudedHeight: number } | undefined = useMemo(
    () => (extrudedHeight ? { extrudedHeight } : undefined),
    [extrudedHeight],
  );

  useEffect(() => {
    requestRender?.();
  });

  return !isVisible || !coordiantes || !show ? null : (
    <>
      <EntityExt
        id={id}
        layerId={layer?.id}
        featureId={feature?.id}
        ref={entityRef}
        availability={availability}
        properties={feature?.properties}
        hideIndicator={hideIndicator}>
        <PolygonGraphics
          hierarchy={hierarchy}
          fill={fill}
          material={memoFillColor}
          outline={!!memoStrokeColor}
          outlineColor={memoStrokeColor}
          outlineWidth={strokeWidth}
          heightReference={heightReference(hr)}
          shadows={shadowMode(shadows)}
          distanceDisplayCondition={distanceDisplayCondition}
          classificationType={classificationType(ct)}
          {...extrudedHeightProperty}
        />
      </EntityExt>
      {/* workaround */}
      {strokes?.map((p, i) => (
        <Entity key={i} id={`${id}-stroke${i}`}>
          <PolylineGraphics
            positions={p}
            clampToGround={hr == "clamp" || hr == "relative"}
            width={strokeWidth}
            material={memoStrokeColor}
            shadows={shadowMode(shadows)}
            distanceDisplayCondition={distanceDisplayCondition}
            classificationType={classificationType(ct)}
          />
        </Entity>
      ))}
    </>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
