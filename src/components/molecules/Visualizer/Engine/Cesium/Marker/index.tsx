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

import { Typography, toCSSFont, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { useIcon, ho, vo } from "../common";
import marker from "./marker.svg";

export type Props = PrimitiveProps<Property>;

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

const tag = "reearth_unselectable";

const Marker: React.FC<PrimitiveProps<Property>> = ({ primitive }) => {
  const { id, isVisible, property } = primitive ?? {};
  const {
    location,
    height = 0,
    extrude,
    pointSize = 10,
    style,
    pointColor,
    label,
    labelTypography,
    labelText,
    labelPosition: labelPos = "right",
    image = marker,
    imageSize,
    imageHorizontalOrigin: horizontalOrigin,
    imageVerticalOrigin: verticalOrigin,
    imageCrop: crop,
    imageShadow: shadow,
    imageShadowColor: shadowColor,
    imageShadowBlur: shadowBlur,
    imageShadowPositionX: shadowOffsetX,
    imageShadowPositionY: shadowOffsetY,
  } = (property as Property | undefined)?.default ?? {};

  const pos = useMemo(() => {
    return location ? Cartesian3.fromDegrees(location.lng, location.lat, height ?? 0) : undefined;
  }, [location, height]);

  const extrudePoints = useMemo(() => {
    return extrude && location
      ? [
          Cartesian3.fromDegrees(location.lng, location.lat, height),
          Cartesian3.fromDegrees(location.lng, location.lat, 0),
        ]
      : undefined;
  }, [extrude, location, height]);

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

  const pixelOffset = useMemo(() => {
    const padding = 15;
    const x = (img?.width && style == "image" ? img.width : pointSize) / 2 + padding;
    const y = (img?.height && style == "image" ? img.height : pointSize) / 2 + padding;
    return new Cartesian2(
      labelPos === "left" || labelPos === "right" ? x * (labelPos === "left" ? -1 : 1) : 0,
      labelPos === "top" || labelPos === "bottom" ? y * (labelPos === "top" ? -1 : 1) : 0,
    );
  }, [img?.width, img?.height, style, pointSize, labelPos]);

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
      <Entity id={id} position={pos}>
        {style === "point" ? (
          <PointGraphics pixelSize={pointSize} color={toColor(pointColor)} />
        ) : (
          <BillboardGraphics
            image={canvas}
            horizontalOrigin={ho(horizontalOrigin)}
            verticalOrigin={vo(verticalOrigin)}
          />
        )}
        {label && (
          <LabelGraphics
            horizontalOrigin={
              labelPos === "right"
                ? HorizontalOrigin.LEFT
                : labelPos === "left"
                ? HorizontalOrigin.RIGHT
                : HorizontalOrigin.CENTER
            }
            verticalOrigin={
              labelPos === "bottom"
                ? VerticalOrigin.TOP
                : labelPos === "top"
                ? VerticalOrigin.BOTTOM
                : VerticalOrigin.CENTER
            }
            pixelOffset={pixelOffset}
            fillColor={toColor(labelTypography?.color)}
            font={toCSSFont(labelTypography, { fontSize: 30 })}
            text={labelText}
          />
        )}
      </Entity>
    </>
  );
};

export default Marker;
