import {
  ArcType,
  Cartesian3,
  Color,
  TimeIntervalCollection,
  TranslationRotationScale,
} from "cesium";
import { FC, memo } from "react";
import { PolylineGraphics } from "resium";

import type { EventCallback } from "@reearth/core/Map";

import { EntityExt } from "../utils";

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
  layerId: string;
  featureId?: string;
  index: number;
  edge: EdgeProperties;
  trs: TranslationRotationScale;
  isHovered: boolean;
  fillColor?: Color;
  hoverColor?: Color;
  width?: number;
  availability?: TimeIntervalCollection;
  onMouseDown?: EdgeEventCallback;
  onMouseMove?: EdgeEventCallback;
  onMouseUp?: EdgeEventCallback;
  onMouseEnter?: EdgeEventCallback;
  onMouseLeave?: EdgeEventCallback;
};

export const Edge: FC<Props> = memo(function EdgePresenter({
  layerId,
  featureId,
  index,
  edge,
  isHovered,
  fillColor,
  trs,
  width,
  hoverColor,
  availability,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) {
  const { cbp, outlineColor } = useHooks({
    id: layerId,
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
    <EntityExt layerId={layerId} featureId={featureId} availability={availability}>
      <PolylineGraphics
        positions={cbp}
        width={width}
        material={outlineColor}
        arcType={ArcType.NONE}
      />
    </EntityExt>
  );
});
