import {
  Cartesian3,
  HeadingPitchRoll,
  Math as CesiumMath,
  Transforms,
  Entity as CesiumEntity,
} from "cesium";
import React, { useEffect, useMemo, useRef } from "react";
import { ModelGraphics, Entity, CesiumComponentRef } from "resium";

import { toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { attachTag, colorBlendMode, draggableTag, heightReference, shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    model?: string;
    location?: { lat: number; lng: number };
    height?: number;
    heightReference?: "none" | "clamp" | "relative";
    heading?: number;
    pitch?: number;
    roll?: number;
    scale?: number;
    maximumScale?: number;
    minimumPixelSize?: number;
    animation?: boolean; // default: true
  };
  appearance?: {
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
    colorBlend?: "none" | "highlight" | "replace" | "mix";
    color?: string;
    colorBlendAmount?: number;
    lightColor?: string;
    silhouette?: boolean;
    silhouetteColor?: string;
    silhouetteSize?: number; // default: 1
  };
};

export default function Model({ layer }: PrimitiveProps<Property>) {
  const { id, isVisible, property } = layer ?? {};
  const {
    model,
    location,
    height,
    heightReference: hr,
    heading,
    pitch,
    roll,
    scale,
    maximumScale,
    minimumPixelSize,
    animation = true,
  } = (property as Property | undefined)?.default ?? {};
  const {
    shadows = "disabled",
    colorBlend = "none",
    color,
    colorBlendAmount,
    lightColor,
    silhouette,
    silhouetteColor,
    silhouetteSize = 1,
  } = property?.appearance ?? {};

  const position = useMemo(() => {
    return location ? Cartesian3.fromDegrees(location.lng, location.lat, height ?? 0) : undefined;
  }, [location, height]);
  const orientation = useMemo(
    () =>
      position
        ? Transforms.headingPitchRollQuaternion(
            position,
            new HeadingPitchRoll(
              CesiumMath.toRadians(heading ?? 0),
              CesiumMath.toRadians(pitch ?? 0),
              CesiumMath.toRadians(roll ?? 0),
            ),
          )
        : undefined,
    [heading, pitch, position, roll],
  );
  const modelColor = useMemo(() => (colorBlend ? toColor(color) : undefined), [colorBlend, color]);
  const modelLightColor = useMemo(() => toColor(lightColor), [lightColor]);
  const modelSilhouetteColor = useMemo(() => toColor(silhouetteColor), [silhouetteColor]);

  const e = useRef<CesiumComponentRef<CesiumEntity>>(null);
  useEffect(() => {
    attachTag(e.current?.cesiumElement, draggableTag, "default.location");
  }, [isVisible, model, position]);

  return !isVisible || !model || !position ? null : (
    <Entity id={id} position={position} orientation={orientation as any} ref={e}>
      <ModelGraphics
        uri={model}
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
      />
    </Entity>
  );
}
