import {
  CallbackProperty,
  HeightReference,
  type Cartesian3,
  type PositionProperty,
  type Property,
} from "@cesium/engine";
import { useMemo, useRef, type FC } from "react";
import { Entity } from "resium";
import invariant from "tiny-invariant";

import { useConstant } from "@reearth/beta/utils/util";

let image: HTMLCanvasElement | undefined;

function getImage(): HTMLCanvasElement {
  if (image != null) {
    return image;
  }
  image = document.createElement("canvas");
  image.width = 16;
  image.height = 16;
  const context = image.getContext("2d");
  invariant(context != null);
  context.fillStyle = "white";
  context.fillRect(3, 3, 10, 10);
  context.strokeStyle = "black";
  context.lineWidth = 2;
  context.strokeRect(3, 3, 10, 10);
  return image;
}

export interface ControlPointProps {
  position: Property | Cartesian3;
  clampToGround?: boolean;
}

export const ControlPoint: FC<ControlPointProps> = ({ position, clampToGround = false }) => {
  const positionRef = useRef(position);
  positionRef.current = position;
  const positionProperty = useConstant(
    () =>
      new CallbackProperty(
        (time, result) =>
          "getValue" in positionRef.current
            ? positionRef.current.getValue(time, result)
            : positionRef.current,
        false,
      ) as unknown as PositionProperty,
  );

  const options = useMemo(
    () => ({
      position: positionProperty,
      billboard: {
        image: getImage(),
        width: 8,
        height: 8,
        heightReference: clampToGround ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
        disableDepthTestDistance: Infinity,
      },
    }),
    [clampToGround, positionProperty],
  );

  return <Entity {...options} />;
};
