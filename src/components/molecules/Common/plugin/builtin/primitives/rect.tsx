import React, { useMemo } from "react";
import { RectangleGraphics, Entity } from "resium";
import { Rectangle, Color, ImageMaterialProperty } from "cesium";

import { Rect as RectValue } from "@reearth/util/value";
import { PrimitiveComponent } from "../../PluginPrimitive";

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

export type PluginProperty = {};

const Rect: PrimitiveComponent<Property, PluginProperty> = ({
  id,
  isVisible,
  onClick,
  property,
}) => {
  const coordinates = useMemo(
    () =>
      property?.default?.rect
        ? new Rectangle(
            property.default.rect.west,
            property.default.rect.south,
            property.default.rect.east,
            property.default.rect.north,
          )
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [property?.default?.rect],
  );

  const material = useMemo(
    () =>
      property?.default?.style === "image"
        ? property.default.image
          ? new ImageMaterialProperty({
              image: property.default.image as any,
            })
          : undefined
        : property?.default?.fillColor
        ? Color.fromCssColorString(property.default.fillColor)
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [property?.default?.style, property?.default?.image, property?.default?.fillColor],
  );
  return !isVisible ? null : (
    <Entity id={id} onClick={onClick}>
      <RectangleGraphics
        height={property?.default?.height}
        extrudedHeight={property?.default?.extrudedHeight}
        coordinates={coordinates}
        material={material}
        fill={!!material}
      />
    </Entity>
  );
};

export default Rect;
