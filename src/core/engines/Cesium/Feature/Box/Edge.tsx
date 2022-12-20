import { ArcType, Cartesian3, Color, TranslationRotationScale } from "cesium";
import { FC, memo } from "react";
import { Entity, PolylineGraphics } from "resium";

import type { EventCallback } from "@reearth/core/Map";

import { useHooks } from "./hooks/edge";

export type EdgeEventCallback = EventCallback<
  [
    event: any,
    edgeEvent: {
      layerId: string;
      index: number;
    },
  ]
>;

export type EdgeProperties = { start: Cartesian3; end: Cartesian3; isDraggable?: boolean };

type Props = {
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
};

export const Edge: FC<Props> = memo(function EdgePresenter({
  id,
  index,
  edge,
  isHovered,
  fillColor,
  trs,
  width,
  hoverColor,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) {
  const { cbp, outlineColor } = useHooks({
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
  });

  return (
    <Entity id={id}>
      <PolylineGraphics
        positions={cbp}
        width={width}
        material={outlineColor}
        arcType={ArcType.NONE}
      />
    </Entity>
  );
});
