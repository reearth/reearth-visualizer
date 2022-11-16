import { Cartesian3, Plane as CesiumPlane, TranslationRotationScale } from "cesium";
import React, { useMemo, useEffect, memo, useState } from "react";

import { LatLngHeight, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";

import { Side } from "./Side";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    location?: LatLngHeight;
    height?: number;
    width?: number;
    length?: number;
    heading?: number;
    pitch?: number;
    roll?: number;
    fillColor?: string;
    outlineColor?: string;
    outlineWidth?: number;
    fill?: boolean;
    outline?: boolean;
  };
};

// The 6 box sides defined as planes in local coordinate space.
// ref: https://github.com/TerriaJS/terriajs/blob/cad62a45cbee98c7561625458bec3a48510f6cbc/lib/Models/BoxDrawing.ts#L161-L169
const SIDE_PLANES: readonly CesiumPlane[] = [
  new CesiumPlane(new Cartesian3(0, 0, 1), 0.5),
  new CesiumPlane(new Cartesian3(0, 0, -1), 0.5),
  new CesiumPlane(new Cartesian3(0, 1, 0), 0.5),
  new CesiumPlane(new Cartesian3(0, -1, 0), 0.5),
  new CesiumPlane(new Cartesian3(1, 0, 0), 0.5),
  new CesiumPlane(new Cartesian3(-1, 0, 0), 0.5),
];

// This is used for plane ID.
// We can use this name, for example you want to move the box when front plane is dragged.
const SIDE_PLANE_NAMES = ["bottom", "top", "front", "back", "left", "right"];

const updateTrs = (trs: TranslationRotationScale, property: Property | undefined) => {
  const { location, height, width, length } = property?.default ?? {};

  const translation = location
    ? Cartesian3.fromDegrees(location.lng, location.lat, location.height ?? 0)
    : undefined;
  if (translation) {
    Cartesian3.clone(translation, trs.translation);
  }

  // Quaternion.clone(trs.rotation, this.trs.rotation);

  Cartesian3.clone(new Cartesian3(width || 100, length || 100, height || 100), trs.scale);

  return trs;
};

const Box: React.FC<PrimitiveProps<Property>> = memo(function BoxPresenter({ layer }) {
  const { id, isVisible, property } = layer ?? {};
  const { fillColor, outlineColor, outlineWidth, fill, outline } = property?.default ?? {};

  const [trs] = useState(() => updateTrs(new TranslationRotationScale(), property));
  useEffect(() => {
    updateTrs(trs, property);
  }, [property, trs]);

  const style = useMemo(
    () => ({
      fillColor: toColor(fillColor),
      outlineColor: toColor(outlineColor),
      outlineWidth,
      fill,
      outline,
    }),
    [fillColor, outlineColor, outlineWidth, fill, outline],
  );

  return !isVisible ? null : (
    <>
      {SIDE_PLANES.map((plane, i) => (
        <Side
          key={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          id={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          planeLocal={plane}
          style={style}
          trs={trs}
        />
      ))}
    </>
  );
});

export default Box;
