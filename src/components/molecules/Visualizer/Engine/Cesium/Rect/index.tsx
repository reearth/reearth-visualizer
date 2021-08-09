import React, { useMemo } from "react";
import { RectangleGraphics, Entity } from "resium";
import { Rectangle, Color, ImageMaterialProperty } from "cesium";

import { Rect as RectValue } from "@reearth/util/value";
import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    rect?: RectValue;
    height?: number;
    extrudedHeight?: number;
    style?: "color" | "image";
    fillColor?: string;
    image?: string;
  };
};

const Rect: React.FC<PrimitiveProps<Property>> = ({ primitive }) => {
  const { id, isVisible, property } = primitive ?? {};
  const { rect, image, style, fillColor, height, extrudedHeight } =
    (property as Property | undefined)?.default ?? {};
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
        ? Color.fromCssColorString(property.default.fillColor)
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [style, image, fillColor],
  );

  return !isVisible ? null : (
    <Entity id={id}>
      <RectangleGraphics
        height={height}
        extrudedHeight={extrudedHeight}
        coordinates={coordinates}
        material={material}
        fill={!!material}
      />
    </Entity>
  );
};

export default Rect;
