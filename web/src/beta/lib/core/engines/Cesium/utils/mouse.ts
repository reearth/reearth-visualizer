import { Viewer } from "cesium";
import { CesiumMovementEvent } from "resium";

import { MouseEventProps } from "../..";
import { getLocationFromScreen } from "../common";

export const makeMouseEventProps = (viewer: Viewer, e: CesiumMovementEvent) => {
  if (!viewer || viewer.isDestroyed()) return;
  const position = e.position || e.startPosition;
  const props: MouseEventProps = {
    x: position?.x,
    y: position?.y,
    ...(position ? getLocationFromScreen(viewer.scene, position.x, position.y, true) ?? {} : {}),
  };
  return props;
};
