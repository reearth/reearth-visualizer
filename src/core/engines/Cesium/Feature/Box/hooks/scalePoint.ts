import {
  CallbackProperty,
  Cartesian3,
  Color,
  JulianDate,
  Matrix4,
  PolylineDashMaterialProperty,
  PositionProperty,
  Quaternion,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  TranslationRotationScale,
} from "cesium";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useCesium } from "resium";

import type { EventCallback } from "@reearth/core/Map";

import type { PointEventCallback, ScalePointProperties } from "../ScalePoints";

export const useHooks = ({
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
}: {
  id: string;
  index: number;
  scalePoint: ScalePointProperties;
  trs: TranslationRotationScale;
  isHovered: boolean;
  pointOutlineColor?: Color;
  hoverPointOutlineColor?: Color;
  axisLineColor?: Color;
  dimensions?: { width: number; height: number; length: number };
  onPointMouseDown?: PointEventCallback;
  onPointMouseMove?: PointEventCallback;
  onPointMouseUp?: PointEventCallback;
}) => {
  const layerId = `${id}-${index}`;
  const oppositeLayerId = `${id}-opposite-${index}`;

  const { viewer } = useCesium();

  const [entitiesPosition] = useState(() => {
    const point = new Cartesian3();
    const oppositePoint = new Cartesian3();

    const pointProperty = new CallbackProperty(() => {
      const matrix = Matrix4.fromTranslationRotationScale(trs);
      Matrix4.multiplyByPoint(matrix, scalePoint.point, point);
      return point;
    }, false) as unknown as PositionProperty;
    const oppositePointProperty = new CallbackProperty(() => {
      const matrix = Matrix4.fromTranslationRotationScale(trs);
      Matrix4.multiplyByPoint(matrix, scalePoint.oppositePoint, oppositePoint);
      return oppositePoint;
    }, false) as unknown as PositionProperty;

    return {
      point: pointProperty,
      oppositePoint: oppositePointProperty,
      axisLine: new CallbackProperty(
        () => [
          pointProperty.getValue(JulianDate.now()),
          oppositePointProperty.getValue(JulianDate.now()),
        ],
        false,
      ),
    };
  });

  const isScalePointHovered = useRef(false);
  const [pointOutlineColorCb] = useState(
    () =>
      new CallbackProperty(
        () => (isScalePointHovered.current ? hoverPointOutlineColor : pointOutlineColor),
        false,
      ),
  );
  useEffect(() => {
    isScalePointHovered.current = isHovered;
  }, [isHovered]);

  const [cesiumDimensions] = useState(
    () => new Cartesian3(dimensions?.width, dimensions?.length, dimensions?.height),
  );
  const [cesiumDimensionsCallbackProperty] = useState(
    () => new CallbackProperty(() => cesiumDimensions, false),
  );
  const [orientation] = useState(() => new CallbackProperty(() => Quaternion.IDENTITY, false));
  const axisColorProperty = useMemo(
    () => new PolylineDashMaterialProperty({ color: axisLineColor, dashLength: 8 }),
    [axisLineColor],
  );

  const isOppositePointClicked = useRef(false);
  const handlePointMouseDown: EventCallback = useCallback(
    e => {
      const currentLayerId = viewer.scene.pick(e.position)?.id?.id;
      isOppositePointClicked.current = currentLayerId === oppositeLayerId;
      if (currentLayerId === layerId || currentLayerId === oppositeLayerId) {
        onPointMouseDown?.(e, {
          layerId: isOppositePointClicked.current ? oppositeLayerId : layerId,
          index,
          opposite: isOppositePointClicked.current,
        });
      }
    },
    [onPointMouseDown, index, layerId, oppositeLayerId, viewer],
  );
  const handlePointMouseMove: EventCallback = useCallback(
    e => {
      onPointMouseMove?.(e, {
        layerId: isOppositePointClicked.current ? oppositeLayerId : layerId,
        index,
        opposite: isOppositePointClicked.current,
        position: isOppositePointClicked.current
          ? entitiesPosition.oppositePoint.getValue(JulianDate.now())
          : entitiesPosition.point.getValue(JulianDate.now()),
        oppositePosition: isOppositePointClicked.current
          ? entitiesPosition.point.getValue(JulianDate.now())
          : entitiesPosition.oppositePoint.getValue(JulianDate.now()),
        pointLocal: isOppositePointClicked ? scalePoint.oppositePoint : scalePoint.point,
      });
    },
    [onPointMouseMove, index, entitiesPosition, scalePoint, layerId, oppositeLayerId],
  );
  const handlePointMouseUp: EventCallback = useCallback(
    e => {
      onPointMouseUp?.(e, {
        layerId: isOppositePointClicked.current ? oppositeLayerId : layerId,
        index,
        opposite: isOppositePointClicked.current,
      });
    },
    [onPointMouseUp, index, layerId, oppositeLayerId],
  );

  useEffect(() => {
    Cartesian3.clone(
      new Cartesian3(dimensions?.width, dimensions?.length, dimensions?.height),
      cesiumDimensions,
    );
  }, [dimensions, cesiumDimensions]);

  const eventHandler = useMemo(() => new ScreenSpaceEventHandler(viewer.scene.canvas), [viewer]);
  useEffect(() => {
    eventHandler.setInputAction(handlePointMouseDown, ScreenSpaceEventType.LEFT_DOWN);
    eventHandler.setInputAction(handlePointMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
    eventHandler.setInputAction(handlePointMouseUp, ScreenSpaceEventType.LEFT_UP);
  }, [eventHandler, handlePointMouseDown, handlePointMouseMove, handlePointMouseUp]);

  useEffect(() => () => eventHandler.destroy(), [eventHandler]);

  return {
    entitiesPosition,
    pointOutlineColorCb,
    cesiumDimensionsCallbackProperty,
    orientation,
    axisColorProperty,
  };
};
