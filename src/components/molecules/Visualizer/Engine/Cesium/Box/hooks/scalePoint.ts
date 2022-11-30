import {
  CallbackProperty,
  Cartesian3,
  Color,
  JulianDate,
  Matrix4,
  PolylineDashMaterialProperty,
  PositionProperty,
  Quaternion,
  TranslationRotationScale,
} from "cesium";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";

import { useContext } from "@reearth/components/molecules/Visualizer/Plugin";
import { EventCallback } from "@reearth/util/event";

import { PointEventCallback, ScalePointProperties } from "../ScalePoints";

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

  const ctx = useContext();

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
      isOppositePointClicked.current = e.layerId === oppositeLayerId;
      if (e.layerId === layerId || e.layerId === oppositeLayerId) {
        onPointMouseDown?.(e, {
          layerId: isOppositePointClicked.current ? oppositeLayerId : layerId,
          index,
          opposite: isOppositePointClicked.current,
        });
      }
    },
    [onPointMouseDown, index, layerId, oppositeLayerId],
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

  useEffect(() => {
    ctx?.reearth.on("mousedown", handlePointMouseDown);
    ctx?.reearth.on("mousemove", handlePointMouseMove);
    ctx?.reearth.on("mouseup", handlePointMouseUp);

    return () => {
      ctx?.reearth.off("mousedown", handlePointMouseDown);
      ctx?.reearth.off("mousemove", handlePointMouseMove);
      ctx?.reearth.off("mouseup", handlePointMouseUp);
    };
  }, [ctx, handlePointMouseDown, handlePointMouseMove, handlePointMouseUp]);

  return {
    entitiesPosition,
    pointOutlineColorCb,
    cesiumDimensionsCallbackProperty,
    orientation,
    axisColorProperty,
  };
};
