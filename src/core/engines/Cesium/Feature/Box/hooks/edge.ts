import {
  CallbackProperty,
  Cartesian3,
  Color,
  ColorMaterialProperty,
  Matrix4,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  TranslationRotationScale,
} from "cesium";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCesium } from "resium";

import type { EventCallback } from "@reearth/core/Map";

import type { EdgeEventCallback, EdgeProperties } from "../Edge";

export const useHooks = ({
  id,
  index,
  edge,
  isHovered,
  fillColor,
  trs,
  hoverColor,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: {
  id: string;
  index: number;
  edge: EdgeProperties;
  trs: TranslationRotationScale;
  isHovered: boolean;
  fillColor?: Color;
  hoverColor?: Color;
  width?: number;
  onMouseDown?: EdgeEventCallback;
  onMouseMove?: EdgeEventCallback;
  onMouseUp?: EdgeEventCallback;
  onMouseEnter?: EdgeEventCallback;
  onMouseLeave?: EdgeEventCallback;
}) => {
  const { viewer } = useCesium();
  const [cbp] = useState(
    () =>
      new CallbackProperty(() => {
        const position1 = new Cartesian3();
        const position2 = new Cartesian3();
        const matrix = Matrix4.fromTranslationRotationScale(trs);
        Matrix4.multiplyByPoint(matrix, edge.start, position1);
        Matrix4.multiplyByPoint(matrix, edge.end, position2);
        return [position1, position2];
      }, false),
  );

  const isEdgeHovered = useRef(false);
  const [outlineColor] = useState(
    () =>
      new ColorMaterialProperty(
        new CallbackProperty(
          () => (isEdgeHovered.current ? hoverColor ?? fillColor : fillColor),
          false,
        ),
      ),
  );
  useEffect(() => {
    isEdgeHovered.current = isHovered;
  }, [isHovered]);

  const handleMouseDown: EventCallback = useCallback(
    e => {
      const currentLayerId = viewer.scene.pick(e.position)?.id?.id;
      if (currentLayerId !== id) {
        return;
      }
      onMouseDown?.(e, { layerId: id, index });
    },
    [onMouseDown, id, index, viewer],
  );

  const handleMouseMove: EventCallback = useCallback(
    e => {
      onMouseMove?.(e, { layerId: id, index });
    },
    [onMouseMove, index, id],
  );

  const handleMouseUp: EventCallback = useCallback(
    e => {
      onMouseUp?.(e, { layerId: id, index });
    },
    [onMouseUp, index, id],
  );

  const eventHandler = useMemo(() => new ScreenSpaceEventHandler(viewer.scene.canvas), [viewer]);
  useEffect(() => {
    eventHandler.setInputAction(handleMouseDown, ScreenSpaceEventType.LEFT_DOWN);
    eventHandler.setInputAction(handleMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
    eventHandler.setInputAction(handleMouseUp, ScreenSpaceEventType.LEFT_UP);
  }, [eventHandler, handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => () => eventHandler.destroy(), [eventHandler]);

  return {
    cbp,
    outlineColor,
  };
};
