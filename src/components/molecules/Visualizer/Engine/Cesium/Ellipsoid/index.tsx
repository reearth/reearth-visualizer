/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import { Entity, EllipsoidGraphics } from "resium";
import { Cartesian3 } from "cesium";

import { LatLng, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    position?: LatLng;
    height?: number;
    radius?: number;
    fillColor?: string;
  };
};

const Ellipsoid: React.FC<PrimitiveProps<Property>> = ({ primitive }) => {
  const { id, isVisible, property } = primitive ?? {};
  const { radius = 1000 } = property?.default ?? {};
  const position = useMemo(() => {
    const { position, height } = property?.default ?? {};
    return position ? Cartesian3.fromDegrees(position.lng, position.lat, height ?? 0) : undefined;
  }, [
    property?.default?.position?.lat,
    property?.default?.position?.lng,
    property?.default?.height,
  ]);

  const raddi = useMemo(() => {
    return new Cartesian3(radius, radius, radius);
  }, [radius]);

  const material = useMemo(
    () => toColor(property?.default?.fillColor),
    [property?.default?.fillColor],
  );

  return !isVisible ? null : (
    <Entity id={id} position={position}>
      <EllipsoidGraphics radii={raddi} material={material} />
    </Entity>
  );
};

export default Ellipsoid;
