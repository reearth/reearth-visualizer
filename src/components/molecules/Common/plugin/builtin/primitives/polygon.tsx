/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import { PolygonGraphics, Entity } from "resium";
import { PolygonHierarchy, Cartesian3 } from "cesium";

import { Polygon as PolygonValue, toColor } from "@reearth/util/value";
import { PrimitiveComponent } from "../../PluginPrimitive";

export type Property = {
  default?: {
    polygon?: PolygonValue;
    fill?: boolean;
    fillColor?: string;
    stroke?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
  };
};

export type PluginProperty = {};

const Polygon: PrimitiveComponent<Property, PluginProperty> = ({
  id,
  isVisible,
  onClick,
  property,
}) => {
  const {
    polygon,
    fill = true,
    stroke,
    fillColor,
    strokeColor,
    strokeWidth = 1,
  } = property?.default ?? {};

  const hierarchy = useMemo(
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
    [polygon],
  );

  const memoStrokeColor = useMemo(
    () => (stroke ? toColor(strokeColor) : undefined),
    [stroke, strokeColor],
  );

  const memoFillColor = useMemo(
    () => (fill && fillColor ? toColor(fillColor) : undefined),
    [fill, fillColor],
  );

  return !isVisible ? null : (
    <Entity id={id} onClick={onClick}>
      <PolygonGraphics
        hierarchy={hierarchy}
        fill={fill}
        material={memoFillColor}
        outline={!!memoStrokeColor}
        outlineColor={memoStrokeColor}
        outlineWidth={strokeWidth}
      />
    </Entity>
  );
};

export default Polygon;
