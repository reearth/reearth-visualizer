/* eslint-disable react-hooks/exhaustive-deps */
import { PolygonHierarchy, Cartesian3 } from "cesium";
import { isEqual } from "lodash-es";
import React, { useMemo } from "react";
import { PolygonGraphics, Entity } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { Polygon as PolygonValue, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { heightReference, shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    polygon?: PolygonValue;
    fill?: boolean;
    fillColor?: string;
    stroke?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
    heightReference?: "none" | "clamp" | "relative";
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  };
};

const Polygon: React.FC<PrimitiveProps<Property>> = ({ layer }) => {
  const { id, isVisible, property } = layer ?? {};
  const {
    polygon,
    fill = true,
    stroke,
    fillColor,
    strokeColor,
    strokeWidth = 1,
    heightReference: hr,
    shadows,
  } = property?.default ?? {};

  const hierarchy = useCustomCompareMemo(
    () =>
      polygon?.[0]
        ? new PolygonHierarchy(
            polygon[0].map(c => Cartesian3.fromDegrees(c.lng, c.lat, c.height)),
            polygon
              .slice(1)
              .map(
                p =>
                  new PolygonHierarchy(p.map(c => Cartesian3.fromDegrees(c.lng, c.lat, c.height))),
              ),
          )
        : undefined,
    [polygon ?? []],
    isEqual,
  );

  const memoStrokeColor = useMemo(
    () => (stroke ? toColor(strokeColor) : undefined),
    [stroke, strokeColor],
  );
  const memoFillColor = useMemo(() => (fill ? toColor(fillColor) : undefined), [fill, fillColor]);

  return !isVisible ? null : (
    <Entity id={id}>
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
    </Entity>
  );
};

export default Polygon;
