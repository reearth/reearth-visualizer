import { ArcType, Cartesian3, Color, TranslationRotationScale } from "cesium";
import { FC, memo } from "react";
import { BoxGraphics, Entity, PolylineGraphics } from "resium";

import { EventCallback } from "@reearth/util/event";

import { useHooks } from "./hooks/scalePoint";

export type ScalePointProperties = {
  point: Cartesian3;
  oppositePoint: Cartesian3;
};

export type PointEventCallback = EventCallback<
  [
    event: any,
    pointEvent: {
      index: number;
      layerId: string;
      opposite: boolean;
      position?: Cartesian3;
      oppositePosition?: Cartesian3;
      pointLocal?: Cartesian3;
    },
  ]
>;

type Props = {
  id: string;
  index: number;
  scalePoint: ScalePointProperties;
  trs: TranslationRotationScale;
  isHovered: boolean;
  pointFillColor?: Color;
  pointOutlineColor?: Color;
  hoverPointOutlineColor?: Color;
  pointOutlineWidth?: number;
  axisLineColor?: Color;
  axisLineWidth?: number;
  dimensions?: { width: number; height: number; length: number };
  visiblePoint?: boolean;
  visibleAxisLine?: boolean;
  onPointMouseDown?: PointEventCallback;
  onPointMouseMove?: PointEventCallback;
  onPointMouseUp?: PointEventCallback;
};

export const ScalePoints: FC<Props> = memo(function ScalePointsPresenter({
  id,
  index,
  scalePoint,
  isHovered,
  pointFillColor,
  pointOutlineColor,
  hoverPointOutlineColor,
  pointOutlineWidth,
  axisLineColor,
  axisLineWidth,
  trs,
  dimensions,
  visiblePoint,
  visibleAxisLine,
  onPointMouseDown,
  onPointMouseMove,
  onPointMouseUp,
}) {
  const {
    entitiesPosition,
    pointOutlineColorCb,
    cesiumDimensionsCallbackProperty,
    orientation,
    axisColorProperty,
  } = useHooks({
    id,
    index,
    scalePoint,
    isHovered,
    pointOutlineColor,
    hoverPointOutlineColor,
    axisLineColor,
    trs,
    dimensions,
    onPointMouseDown,
    onPointMouseMove,
    onPointMouseUp,
  });

  return (
    <>
      <Entity id={`${id}-${index}`} position={entitiesPosition.point} orientation={orientation}>
        <BoxGraphics
          show={visiblePoint}
          dimensions={cesiumDimensionsCallbackProperty}
          material={pointFillColor}
          fill={!!pointFillColor}
          outline={!!pointOutlineColor}
          outlineColor={pointOutlineColorCb}
          outlineWidth={pointOutlineWidth}
        />
      </Entity>
      <Entity
        id={`${id}-opposite-${index}`}
        position={entitiesPosition.oppositePoint}
        orientation={orientation}>
        <BoxGraphics
          show={visiblePoint}
          dimensions={cesiumDimensionsCallbackProperty}
          material={pointFillColor}
          fill={!!pointFillColor}
          outline={!!pointOutlineColor}
          outlineColor={pointOutlineColorCb}
          outlineWidth={pointOutlineWidth}
        />
      </Entity>
      <Entity id={`${id}-axis-line-${index}`}>
        <PolylineGraphics
          positions={entitiesPosition.axisLine}
          show={visibleAxisLine}
          material={axisColorProperty}
          width={axisLineWidth}
          arcType={ArcType.NONE}
        />
      </Entity>
    </>
  );
});
