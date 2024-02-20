/* eslint-disable react-hooks/exhaustive-deps */
import { CallbackProperty, Cartesian3, PositionProperty } from "cesium";
import { useMemo } from "react";
import { EllipseGraphics } from "resium";

import { toColor } from "@reearth/beta/utils/value";

import type { EllipseAppearance } from "../../..";
import { classificationType, heightReference, shadowMode } from "../../common";
import {
  EntityExt,
  toDistanceDisplayCondition,
  toTimeInterval,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

export type Props = FeatureProps<Property>;

export type Property = EllipseAppearance;

export default function Ellipse({ id, isVisible, property, geometry, layer, feature }: Props) {
  const { show = true } = property ?? {};
  const coordinates = useMemo(
    () => (geometry?.type === "Point" ? geometry.coordinates : undefined),
    [geometry?.coordinates, geometry?.type],
  );

  const {
    heightReference: hr,
    shadows,
    radius = 1000,
    fillColor,
    fill,
    classificationType: ct,
  } = property ?? {};
  const { useTransition, translate } = layer?.transition ?? {};

  const pos = useMemo(
    () =>
      coordinates
        ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
        : undefined,
    [coordinates],
  );
  const translateCallbackProperty = useMemo(
    () =>
      useTransition && translate
        ? new CallbackProperty(() => Cartesian3.fromDegrees(...translate), false)
        : undefined,
    [useTransition, translate],
  );

  const semiAxisProperty = useMemo(
    () => (useTransition ? new CallbackProperty(() => radius, false) : radius),
    [radius],
  );

  const material = useMemo(() => toColor(fillColor), [fillColor]);
  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);
  const distanceDisplayCondition = useMemo(
    () => toDistanceDisplayCondition(property?.near, property?.far),
    [property?.near, property?.far],
  );

  return !isVisible || !pos || !show ? null : (
    <EntityExt
      id={id}
      position={(translateCallbackProperty as unknown as PositionProperty) || pos}
      layerId={layer?.id}
      featureId={feature?.id}
      draggable
      availability={availability}
      properties={feature?.properties}>
      <EllipseGraphics
        // Support drawing circle, not an ellipse.
        semiMajorAxis={semiAxisProperty}
        semiMinorAxis={semiAxisProperty}
        material={material}
        fill={fill}
        heightReference={heightReference(hr)}
        classificationType={classificationType(ct)}
        shadows={shadowMode(shadows)}
        distanceDisplayCondition={distanceDisplayCondition}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
