import {
  CallbackProperty,
  Cartesian3,
  Color,
  ColorMaterialProperty,
  Matrix4,
  TranslationRotationScale,
} from "cesium";
import { useCallback, useEffect, useRef, useState } from "react";

import { useContext } from "@reearth/components/molecules/Visualizer/Plugin";
import { EventCallback } from "@reearth/util/event";

import { EdgeEventCallback, EdgeProperties } from "../Edge";

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
  const ctx = useContext();
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
      if (e.layerId !== id) {
        return;
      }
      onMouseDown?.(e, { layerId: id, index });
    },
    [onMouseDown, id, index],
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

  useEffect(() => {
    ctx?.reearth.on("mousedown", handleMouseDown);
    ctx?.reearth.on("mousemove", handleMouseMove);
    ctx?.reearth.on("mouseup", handleMouseUp);
    return () => {
      ctx?.reearth.off("mousedown", handleMouseDown);
      ctx?.reearth.off("mousemove", handleMouseMove);
      ctx?.reearth.off("mouseup", handleMouseUp);
    };
  }, [ctx, handleMouseDown, handleMouseMove, handleMouseUp]);

  return {
    cbp,
    outlineColor,
  };
};
