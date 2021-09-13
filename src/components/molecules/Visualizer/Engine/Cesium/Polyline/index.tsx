import { Cartesian3 } from "cesium";
import React, { useMemo } from "react";
import { PolylineGraphics, Entity } from "resium";

import { Coordinates, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    coordinates?: Coordinates;
    clampToGround?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  };
};

const Polyline: React.FC<PrimitiveProps<Property>> = ({ primitive }) => {
  const { id, isVisible, property } = primitive ?? {};
  const {
    coordinates,
    clampToGround,
    strokeColor,
    strokeWidth = 1,
    shadows,
  } = (property as Property | undefined)?.default ?? {};

  const positions = useMemo(
    () => coordinates?.map(c => Cartesian3.fromDegrees(c.lng, c.lat, c.height)),
    [coordinates],
  );
  const material = useMemo(() => toColor(strokeColor), [strokeColor]);

  return !isVisible ? null : (
    <Entity id={id}>
      <PolylineGraphics
        positions={positions}
        width={strokeWidth}
        material={material}
        clampToGround={clampToGround}
        shadows={shadowMode(shadows)}
      />
    </Entity>
  );
};

export default Polyline;
