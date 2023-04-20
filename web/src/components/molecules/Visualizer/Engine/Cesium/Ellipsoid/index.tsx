/* eslint-disable react-hooks/exhaustive-deps */
import { Cartesian3, Entity as CesiumEntity } from "cesium";
import React, { useEffect, useMemo, useRef } from "react";
import { Entity, EllipsoidGraphics, CesiumComponentRef } from "resium";

import { LatLng, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { attachTag, draggableTag, heightReference, shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    position?: LatLng;
    location?: LatLng;
    height?: number;
    heightReference?: "none" | "clamp" | "relative";
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
    radius?: number;
    fillColor?: string;
  };
};

const Ellipsoid: React.FC<PrimitiveProps<Property>> = ({ layer }) => {
  const { id, isVisible, property } = layer ?? {};
  const { heightReference: hr, shadows, radius = 1000, fillColor } = property?.default ?? {};

  const position = useMemo(() => {
    const { position, location, height } = property?.default ?? {};
    const pos = position || location;
    return pos ? Cartesian3.fromDegrees(pos.lng, pos.lat, height ?? 0) : undefined;
  }, [
    property?.default?.position?.lat,
    property?.default?.position?.lng,
    property?.default?.location?.lat,
    property?.default?.location?.lng,
    property?.default?.height,
  ]);

  const raddi = useMemo(() => {
    return new Cartesian3(radius, radius, radius);
  }, [radius]);

  const material = useMemo(() => toColor(fillColor), [fillColor]);

  const e = useRef<CesiumComponentRef<CesiumEntity>>(null);
  useEffect(() => {
    attachTag(
      e.current?.cesiumElement,
      draggableTag,
      property?.default?.location ? "default.location" : "default.position",
    );
  }, [isVisible, position, property?.default?.location]);

  return !isVisible || !position ? null : (
    <Entity id={id} position={position} ref={e}>
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
