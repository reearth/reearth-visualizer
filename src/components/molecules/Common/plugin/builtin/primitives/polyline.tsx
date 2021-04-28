/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import { PolylineGraphics, Entity } from "resium";
import { Cartesian3 } from "cesium";

import { Coordinates, toColor } from "@reearth/util/value";
import { PrimitiveComponent } from "../../PluginPrimitive";

export type Property = {
  default?: {
    coordinates?: Coordinates;
    strokeColor?: string;
    strokeWidth?: number;
  };
};

export type PluginProperty = {};

const Polyline: PrimitiveComponent<Property, PluginProperty> = ({
  id,
  isVisible,
  onClick,
  property,
}) => {
  const { coordinates, strokeColor, strokeWidth = 1 } = property?.default ?? {};

  const positions = useMemo(
    () => coordinates?.map(c => Cartesian3.fromDegrees(c.lng, c.lat, c.height)),
    [coordinates],
  );

  const material = useMemo(() => toColor(strokeColor), [strokeColor]);

  return !isVisible ? null : (
    <Entity id={id} onClick={onClick}>
      <PolylineGraphics positions={positions} width={strokeWidth} material={material} />
    </Entity>
  );
};

export default Polyline;
