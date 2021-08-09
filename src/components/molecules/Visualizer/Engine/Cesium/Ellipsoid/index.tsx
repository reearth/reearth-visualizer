/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import { Entity, EllipsoidGraphics } from "resium";
import { Cartesian3 } from "cesium";

import { LatLng, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { heightReference, shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    position?: LatLng;
    height?: number;
    heightReference?: "none" | "clamp" | "relative";
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
    radius?: number;
    fillColor?: string;
  };
};

const Ellipsoid: React.FC<PrimitiveProps<Property>> = ({ primitive }) => {
  const { id, isVisible, property } = primitive ?? {};
  const {
    heightReference: hr,
    shadows,
    radius = 1000,
    fillColor,
  } = (property as Property | undefined)?.default ?? {};

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

  const material = useMemo(() => toColor(fillColor), [fillColor]);

  return !isVisible ? null : (
    <Entity id={id} position={position}>
      <EllipsoidGraphics
        radii={raddi}
        material={material}
        heightReference={heightReference(hr)}
        shadows={shadowMode(shadows)}
      />
    </Entity>
  );
};

export default Ellipsoid;
