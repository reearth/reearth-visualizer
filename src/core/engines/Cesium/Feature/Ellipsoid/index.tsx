/* eslint-disable react-hooks/exhaustive-deps */
import { Cartesian3 } from "cesium";
import { useMemo } from "react";
import { EllipsoidGraphics } from "resium";

import { LatLng, toColor } from "@reearth/util/value";

import type { EllipsoidAppearance } from "../../..";
import { heightReference, shadowMode } from "../../common";
import { EntityExt, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;

export type Property = EllipsoidAppearance & {
  // compat
  position?: LatLng;
  location?: LatLng;
  height?: number;
};

export default function Ellipsoid({ id, isVisible, property, geometry, layer, feature }: Props) {
  const coordinates = useMemo(
    () =>
      geometry?.type === "Point"
        ? geometry.coordinates
        : property?.position
        ? [property.position.lng, property.position.lat, property.height ?? 0]
        : property?.location
        ? [property.location.lng, property.location.lat, property.height ?? 0]
        : undefined,
    [geometry?.coordinates, geometry?.type, property?.height, property?.location],
  );

  const { heightReference: hr, shadows, radius = 1000, fillColor } = property ?? {};

  const pos = useMemo(
    () =>
      coordinates
        ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
        : undefined,
    [coordinates],
  );

  const raddi = useMemo(() => {
    return new Cartesian3(radius, radius, radius);
  }, [radius]);

  const material = useMemo(() => toColor(fillColor), [fillColor]);

  return !isVisible || !pos ? null : (
    <EntityExt
      id={id}
      position={pos}
      layerId={layer?.id}
      featureId={feature?.id}
      draggable
      legacyLocationPropertyKey="default.position">
      <EllipsoidGraphics
        radii={raddi}
        material={material}
        heightReference={heightReference(hr)}
        shadows={shadowMode(shadows)}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
