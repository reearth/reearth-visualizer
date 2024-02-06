import {
  ArcType,
  Cartesian3,
  Color,
  TimeIntervalCollection,
  TranslationRotationScale,
  DistanceDisplayCondition,
} from "cesium";
import { FC, memo } from "react";
import { PolylineGraphics } from "resium";

import type { EventCallback } from "@reearth/beta/lib/core/Map";

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
  distanceDisplayCondition?: DistanceDisplayCondition;
  onMouseDown?: EdgeEventCallback;
  onMouseMove?: EdgeEventCallback;
  onMouseUp?: EdgeEventCallback;
  onMouseEnter?: EdgeEventCallback;
  onMouseLeave?: EdgeEventCallback;
  hideIndicator?: boolean;
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
  distanceDisplayCondition,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  hideIndicator,
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
    <EntityExt
      layerId={layerId}
      featureId={featureId}
      availability={availability}
      hideIndicator={hideIndicator}>
      <PolylineGraphics
        positions={cbp}
        width={width}
        material={outlineColor}
        arcType={ArcType.NONE}
        distanceDisplayCondition={distanceDisplayCondition}
      />
    </EntityExt>
  );
});
