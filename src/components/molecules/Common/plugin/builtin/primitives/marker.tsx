/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef, useEffect } from "react";
import {
  Entity,
  BillboardGraphics,
  PointGraphics,
  LabelGraphics,
  PolylineGraphics,
  CesiumComponentRef,
} from "resium";
import {
  Entity as CesiumEntity,
  Cartesian3,
  Color,
  HorizontalOrigin,
  VerticalOrigin,
  Cartesian2,
  PropertyBag,
} from "cesium";

import { PrimitiveComponent } from "../../PluginPrimitive";
import { Typography, toCSSFont, toColor } from "@reearth/util/value";
import { useIcon, ho, vo } from "./common";
import marker from "./marker.svg";

type Property = {
  default?: {
    location?: { lat: number; lng: number };
    height?: number;
    style?: "none" | "point" | "image";
    pointSize?: number;
    pointColor?: string;
    image?: string;
    imageSize?: number;
    imageHorizontalOrigin?: "left" | "center" | "right";
    imageVerticalOrigin?: "top" | "center" | "baseline" | "bottom";
    imageCrop?: "none" | "rounded" | "circle";
    imageShadow?: boolean;
    imageShadowColor?: string;
    imageShadowBlur?: number;
    imageShadowPositionX?: number;
    imageShadowPositionY?: number;
    label?: boolean;
    labelText?: string;
    labelPosition?: "left" | "right" | "top" | "bottom";
    labelTypography?: Typography;
    extrude?: boolean;
  };
};

type PluginProperty = {};

const tag = "reearth_unselectable";

const Marker: PrimitiveComponent<Property, PluginProperty> = ({
  id,
  property,
  isVisible,
  onClick,
}) => {
  const {
    location,
    height = 0,
    extrude,
    pointSize = 10,
    style,
    image = marker,
    imageSize = 1,
    imageHorizontalOrigin: horizontalOrigin,
    imageVerticalOrigin: verticalOrigin,
    imageCrop: crop,
    imageShadow: shadow,
    imageShadowColor: shadowColor,
    imageShadowBlur: shadowBlur,
    imageShadowPositionX: shadowOffsetX,
    imageShadowPositionY: shadowOffsetY,
  } = property?.default ?? {};

  const pos = useMemo(() => {
    return location ? Cartesian3.fromDegrees(location.lng, location.lat, height ?? 0) : undefined;
  }, [location?.lat, location?.lng, height]);

  const extrudePoints = useMemo(() => {
    const location = extrude ? property?.default?.location : undefined;
    return location
      ? [
          Cartesian3.fromDegrees(location.lng, location.lat, height),
          Cartesian3.fromDegrees(location.lng, location.lat, 0),
        ]
      : undefined;
  }, [location?.lat, location?.lng, height, extrude]);

  const [canvas, img] = useIcon({
    image,
    imageSize,
    crop,
    shadow,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
  });

  const labelPos = property?.default?.labelPosition ?? "left";
  const labelLeft = labelPos === "left";
  const labelRight = labelPos === "right";
  const labelTop = labelPos === "top";
  const labelBottom = labelPos === "bottom";
  const labelHorizontal = labelLeft || labelRight;
  const labelVertical = labelTop || labelBottom;

  const pixelOffset = useMemo(() => {
    const padding = 10;
    const x = (img?.width && style == "image" ? img.width * imageSize : pointSize) / 2 + padding;
    const y = (img?.height && style == "image" ? img.height * imageSize : pointSize) / 2 + padding;
    return new Cartesian2(
      labelHorizontal ? x * (labelRight ? -1 : 1) : 0,
      labelVertical ? y * (labelBottom ? -1 : 1) : 0,
    );
  }, [img, imageSize, pointSize, labelHorizontal, labelRight, labelVertical, labelBottom, style]);

  const e = useRef<CesiumComponentRef<CesiumEntity>>(null);
  useEffect(() => {
    // disable selecting polyline
    const ent = e.current?.cesiumElement;
    if (!ent) return;
    if (!ent.properties) {
      ent.properties = new PropertyBag({ [tag]: true });
    } else if (!ent.properties.hasProperty(tag)) {
      ent.properties.addProperty(tag, true);
    }
  }, [extrudePoints]);

  return !pos || !isVisible ? null : (
    <>
      {extrudePoints && (
        <Entity ref={e}>
          <PolylineGraphics
            positions={extrudePoints}
            material={Color.WHITE.withAlpha(0.4)}
            width={0.5}
          />
        </Entity>
      )}
      <Entity id={id} position={pos} onClick={onClick}>
        {property?.default?.style === "point" ? (
          <PointGraphics pixelSize={pointSize} color={toColor(property?.default?.pointColor)} />
        ) : (
          <BillboardGraphics
            image={canvas}
            horizontalOrigin={ho(horizontalOrigin)}
            verticalOrigin={vo(verticalOrigin)}
          />
        )}
        {property?.default?.label && (
          <LabelGraphics
            horizontalOrigin={
              labelLeft
                ? HorizontalOrigin.LEFT
                : labelRight
                ? HorizontalOrigin.RIGHT
                : HorizontalOrigin.CENTER
            }
            verticalOrigin={
              labelTop
                ? VerticalOrigin.TOP
                : labelBottom
                ? VerticalOrigin.BOTTOM
                : VerticalOrigin.CENTER
            }
            pixelOffset={pixelOffset}
            fillColor={toColor(property?.default?.labelTypography?.color)}
            font={toCSSFont(property?.default?.labelTypography, { fontSize: 30 })}
            text={property?.default?.labelText}
          />
        )}
      </Entity>
    </>
  );
};

export default Marker;
