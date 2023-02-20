import { Cartesian3, HeadingPitchRoll, Math as CesiumMath, Transforms } from "cesium";
import { useMemo } from "react";
import { ModelGraphics } from "resium";

import { toColor } from "@reearth/util/value";

import type { ModelAppearance } from "../../..";
import { colorBlendMode, heightReference, shadowMode } from "../../common";
import {
  EntityExt,
  toDistanceDisplayCondition,
  toTimeInterval,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

export type Props = FeatureProps<Property>;

export type Property = ModelAppearance & {
  location?: { lat: number; lng: number };
  height?: number;
};

export default function Model({ id, isVisible, property, geometry, layer, feature }: Props) {
  const coordinates = useMemo(
    () =>
      geometry?.type === "Point"
        ? geometry.coordinates
        : property?.location
        ? [property.location.lng, property.location.lat, property.height ?? 0]
        : undefined,
    [geometry?.coordinates, geometry?.type, property?.height, property?.location],
  );

  const {
    model,
    url,
    heightReference: hr,
    heading,
    pitch,
    roll,
    scale,
    maximumScale,
    minimumPixelSize,
    animation = true,
    shadows = "disabled",
    colorBlend = "none",
    color,
    colorBlendAmount,
    lightColor,
    silhouette,
    silhouetteColor,
    bearing,
    silhouetteSize = 1,
  } = property ?? {};

  const position = useMemo(() => {
    return coordinates
      ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
      : undefined;
  }, [coordinates]);
  const orientation = useMemo(
    () =>
      position
        ? bearing
          ? Transforms.headingPitchRollQuaternion(
              position,
              HeadingPitchRoll.fromDegrees(bearing - 90.0, 0.0, 0.0),
            )
          : Transforms.headingPitchRollQuaternion(
              position,
              new HeadingPitchRoll(
                CesiumMath.toRadians(heading ?? 0),
                CesiumMath.toRadians(pitch ?? 0),
                CesiumMath.toRadians(roll ?? 0),
              ),
            )
        : undefined,
    [bearing, heading, pitch, position, roll],
  );
  const modelColor = useMemo(() => (colorBlend ? toColor(color) : undefined), [colorBlend, color]);
  const modelLightColor = useMemo(() => toColor(lightColor), [lightColor]);
  const modelSilhouetteColor = useMemo(() => toColor(silhouetteColor), [silhouetteColor]);
  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);
  const distanceDisplayCondition = useMemo(
    () => toDistanceDisplayCondition(property?.near, property?.far),
    [property?.near, property?.far],
  );

  return !isVisible || (!model && !url) || !position ? null : (
    <EntityExt
      id={id}
      position={position}
      orientation={orientation as any}
      layerId={layer?.id}
      featureId={feature?.id}
      draggable
      availability={availability}>
      <ModelGraphics
        uri={model || url}
        scale={scale}
        shadows={shadowMode(shadows)}
        colorBlendMode={colorBlendMode(colorBlend)}
        colorBlendAmount={colorBlendAmount}
        color={modelColor}
        lightColor={modelLightColor}
        runAnimations={animation}
        silhouetteColor={modelSilhouetteColor}
        silhouetteSize={silhouette ? silhouetteSize : undefined}
        heightReference={heightReference(hr)}
        maximumScale={maximumScale}
        minimumPixelSize={minimumPixelSize}
        distanceDisplayCondition={distanceDisplayCondition}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
