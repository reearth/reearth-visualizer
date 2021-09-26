import { Rectangle, Color, ImageMaterialProperty } from "cesium";
import React, { useMemo } from "react";
import { RectangleGraphics, Entity } from "resium";

import { Rect as RectValue } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { heightReference, shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    rect?: RectValue;
    height?: number;
    extrudedHeight?: number;
    style?: "color" | "image";
    fillColor?: string;
    image?: string;
    outlineColor?: string;
    outlineWidth?: number;
    heightReference?: "none" | "clamp" | "relative";
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  };
};

const Rect: React.FC<PrimitiveProps<Property>> = ({ layer }) => {
  const { id, isVisible, property } = layer ?? {};
  const {
    rect,
    image,
    style,
    fillColor,
    height,
    extrudedHeight,
    outlineColor,
    outlineWidth,
    heightReference: hr,
    shadows,
  } = property?.default ?? {};

  const coordinates = useMemo(
    () =>
      rect &&
      rect.west <= rect.east &&
      rect.south <= rect.north &&
      rect.east >= -180 &&
      rect.east <= 180 &&
      rect.west >= -180 &&
      rect.west <= 180 &&
      rect.south >= -90 &&
      rect.south <= 90 &&
      rect.north >= -90 &&
      rect.north <= 90
        ? Rectangle.fromDegrees(rect.west, rect.south, rect.east, rect.north)
        : undefined,
    [rect],
  );

  const material = useMemo(
    () =>
      style === "image"
        ? image
          ? new ImageMaterialProperty({
              image,
            })
          : undefined
        : fillColor
        ? Color.fromCssColorString(fillColor)
        : undefined,
    [style, image, fillColor],
  );

  const outline = useMemo(
    () => (outlineColor ? Color.fromCssColorString(outlineColor) : undefined),
    [outlineColor],
  );

  return !isVisible ? null : (
    <Entity id={id}>
      <RectangleGraphics
        height={height}
        extrudedHeight={extrudedHeight}
        coordinates={coordinates}
        material={material}
        fill={!!material}
        outline={!!outline}
        outlineColor={outline}
        outlineWidth={outlineWidth}
        heightReference={heightReference(hr)}
        shadows={shadowMode(shadows)}
      />
    </Entity>
  );
};

export default Rect;
