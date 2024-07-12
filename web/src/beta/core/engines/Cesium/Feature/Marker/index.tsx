import { Cartesian3, Color, HorizontalOrigin, VerticalOrigin, Cartesian2 } from "cesium";
import { useMemo } from "react";
import { BillboardGraphics, PointGraphics, LabelGraphics, PolylineGraphics } from "resium";

import { toCSSFont } from "@reearth/beta/utils/value";

import type { MarkerAppearance } from "../../..";
import { useIcon, ho, vo, heightReference, toColor } from "../../common";
import {
  EntityExt,
  toDistanceDisplayCondition,
  toTimeInterval,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

import marker from "./marker.svg";

export type Props = FeatureProps<Property>;

export type Property = MarkerAppearance & {
  // compat
  location?: { lat: number; lng: number };
  height?: number;
};

export default function Marker({ property, id, isVisible, geometry, layer, feature }: Props) {
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
    show = true,
    extrude,
    pointSize = 10,
    style,
    pointColor,
    pointOutlineColor,
    pointOutlineWidth,
    label,
    labelTypography,
    labelText,
    labelPosition: labelPos = "right",
    labelBackground,
    labelBackgroundColor,
    labelBackgroundPaddingHorizontal,
    labelBackgroundPaddingVertical,
    image = marker,
    imageSize,
    imageSizeInMeters,
    imageHorizontalOrigin: horizontalOrigin,
    imageVerticalOrigin: verticalOrigin,
    imageColor,
    imageCrop: crop,
    imageShadow: shadow,
    imageShadowColor: shadowColor,
    imageShadowBlur: shadowBlur,
    imageShadowPositionX: shadowOffsetX,
    imageShadowPositionY: shadowOffsetY,
    heightReference: hr,
  } = property ?? {};

  const pos = useMemo(() => {
    return coordinates
      ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
      : undefined;
  }, [coordinates]);

  const extrudePoints = useMemo(() => {
    return extrude && coordinates && typeof coordinates[2] === "number"
      ? [
        Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]),
        Cartesian3.fromDegrees(coordinates[0], coordinates[1], 0),
      ]
      : undefined;
  }, [coordinates, extrude]);

  const isStyleImage = !style || style === "image";
  const [icon, imgw, imgh] = useIcon({
    image: isStyleImage ? image : undefined,
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
    const x = (isStyleImage ? imgw : pointSize) / 2 + padding;
    const y = (isStyleImage ? imgh : pointSize) / 2 + padding;
    return new Cartesian2(
      labelPos.includes("left") || labelPos.includes("right")
        ? x * (labelPos.includes("left") ? -1 : 1)
        : 0,
      labelPos.includes("top") || labelPos.includes("bottom")
        ? y * (labelPos.includes("top") ? -1 : 1)
        : 0,
    );
  }, [isStyleImage, imgw, pointSize, imgh, labelPos]);

  const extrudePointsLineColor = useMemo(() => {
    return Color.WHITE.withAlpha(0.4);
  }, []);

  const imageColorCesium = useMemo(() => toColor(imageColor), [imageColor]);
  const pointColorCesium = useMemo(() => toColor(pointColor), [pointColor]);
  const pointOutlineColorCesium = useMemo(() => toColor(pointOutlineColor), [pointOutlineColor]);
  const labelColorCesium = useMemo(() => toColor(labelTypography?.color), [labelTypography?.color]);
  const labelBackgroundColorCesium = useMemo(
    () => toColor(labelBackgroundColor),
    [labelBackgroundColor],
  );
  const labelBackgroundPadding = useMemo(
    // https://cesium.com/learn/cesiumjs/ref-doc/LabelGraphics.html?classFilter=labelgra#backgroundPadding
    () =>
      new Cartesian2(labelBackgroundPaddingHorizontal || 7, labelBackgroundPaddingVertical || 5),
    [labelBackgroundPaddingHorizontal, labelBackgroundPaddingVertical],
  );

  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);
  const distanceDisplayCondition = useMemo(
    () => toDistanceDisplayCondition(property?.near, property?.far),
    [property?.near, property?.far],
  );

  return !pos || !isVisible || !show ? null : (
    <>
      {extrudePoints && (
        <EntityExt
          layerId={layer?.id}
          featureId={feature?.id}
          unselectable
          properties={feature?.properties}
          availability={availability}>
          <PolylineGraphics
            positions={extrudePoints}
            material={extrudePointsLineColor}
            width={0.5}
            distanceDisplayCondition={distanceDisplayCondition}
          />
        </EntityExt>
      )}
      <EntityExt
        id={id}
        position={pos}
        layerId={layer?.id}
        featureId={feature?.id}
        draggable
        properties={feature?.properties}
        availability={availability}>
        {style === "point" ? (
          <PointGraphics
            pixelSize={pointSize}
            color={pointColorCesium}
            outlineColor={pointOutlineColorCesium}
            outlineWidth={pointOutlineWidth}
            heightReference={heightReference(hr)}
            distanceDisplayCondition={distanceDisplayCondition}
          />
        ) : (
          <BillboardGraphics
            image={icon}
            color={imageColorCesium}
            horizontalOrigin={ho(horizontalOrigin)}
            verticalOrigin={vo(verticalOrigin)}
            heightReference={heightReference(hr)}
            distanceDisplayCondition={distanceDisplayCondition}
            sizeInMeters={imageSizeInMeters}
          />
        )}
        {label && (
          <LabelGraphics
            horizontalOrigin={
              labelPos === "right" || labelPos == "righttop" || labelPos === "rightbottom"
                ? HorizontalOrigin.LEFT
                : labelPos === "left" || labelPos === "lefttop" || labelPos === "leftbottom"
                  ? HorizontalOrigin.RIGHT
                  : HorizontalOrigin.CENTER
            }
            verticalOrigin={
              labelPos === "bottom" || labelPos === "rightbottom" || labelPos === "leftbottom"
                ? VerticalOrigin.TOP
                : labelPos === "top" || labelPos === "righttop" || labelPos === "lefttop"
                  ? VerticalOrigin.BOTTOM
                  : VerticalOrigin.CENTER
            }
            pixelOffset={pixelOffset}
            fillColor={labelColorCesium}
            font={toCSSFont(labelTypography, { fontSize: 30 })}
            text={labelText}
            showBackground={labelBackground}
            backgroundColor={labelBackgroundColorCesium}
            backgroundPadding={labelBackgroundPadding}
            heightReference={heightReference(hr)}
            distanceDisplayCondition={distanceDisplayCondition}
          />
        )}
      </EntityExt>
    </>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
