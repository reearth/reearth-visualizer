/* eslint-disable react-hooks/exhaustive-deps */
import { Cartesian3, PolygonHierarchy } from "cesium";
import { isEqual } from "lodash-es";
import { useMemo } from "react";
import { PolygonGraphics } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { Polygon as PolygonValue, toColor } from "@reearth/util/value";

import type { PolygonAppearance } from "../../..";
import { heightReference, shadowMode } from "../../common";
import { EntityExt, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;

export type Property = PolygonAppearance & {
  polygon?: PolygonValue;
};

export default function Polygon({ id, isVisible, property, geometry, layer, feature }: Props) {
  const coordiantes = useMemo(
    () =>
      geometry?.type === "Polygon"
        ? geometry.coordinates
        : property?.polygon
        ? property.polygon.map(p => p.map(q => [q.lng, q.lat, q.height]))
        : undefined,
    [geometry?.coordinates, geometry?.type, property?.polygon],
  );

  const {
    fill = true,
    stroke,
    fillColor,
    strokeColor,
    strokeWidth = 1,
    heightReference: hr,
    shadows,
  } = property ?? {};

  const hierarchy = useCustomCompareMemo(
    () =>
      coordiantes?.[0]
        ? new PolygonHierarchy(
            coordiantes[0].map(c => Cartesian3.fromDegrees(c[0], c[1], c[2])),
            coordiantes
              .slice(1)
              .map(p => new PolygonHierarchy(p.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2])))),
          )
        : undefined,
    [coordiantes ?? []],
    isEqual,
  );

  const memoStrokeColor = useMemo(
    () => (stroke ? toColor(strokeColor) : undefined),
    [stroke, strokeColor],
  );
  const memoFillColor = useMemo(() => (fill ? toColor(fillColor) : undefined), [fill, fillColor]);

  return !isVisible ? null : (
    <EntityExt id={id} layerId={layer?.id} featureId={feature?.id}>
      <PolygonGraphics
        hierarchy={hierarchy}
        fill={fill}
        material={memoFillColor}
        outline={!!memoStrokeColor}
        outlineColor={memoStrokeColor}
        outlineWidth={strokeWidth}
        heightReference={heightReference(hr)}
        shadows={shadowMode(shadows)}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
