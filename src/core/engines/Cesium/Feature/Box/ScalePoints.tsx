import { ArcType, Cartesian3, Color, TranslationRotationScale } from "cesium";
import { FC, memo } from "react";
import { BoxGraphics, PolylineGraphics } from "resium";

import type { EventCallback } from "@reearth/core/Map";

import { EntityExt } from "../utils";

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
  layerId: string;
  featureId?: string;
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
  layerId,
  featureId,
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
    id: layerId,
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
      <EntityExt
        layerId={`${layerId}-${index}`}
        featureId={`${featureId}-${index}`}
        position={entitiesPosition.point}
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
      </EntityExt>
      <EntityExt
        layerId={`${layerId}-opposite-${index}`}
        featureId={`${featureId}-opposite-${index}`}
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
      </EntityExt>
      <EntityExt
        layerId={`${layerId}-axis-line-${index}`}
        featureId={`${featureId}-axis-line-${index}`}>
        <PolylineGraphics
          positions={entitiesPosition.axisLine}
          show={visibleAxisLine}
          material={axisColorProperty}
          width={axisLineWidth}
          arcType={ArcType.NONE}
        />
      </EntityExt>
    </>
  );
});
