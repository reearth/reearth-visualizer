import {
  Cartesian3,
  HeadingPitchRoll,
  Quaternion,
  Math as CesiumMath,
  TranslationRotationScale,
  Cartesian2,
  Cartographic,
} from "cesium";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCesium } from "resium";

import type { Property } from "..";
import { sampleTerrainHeightFromCartesian } from "../../../common";
import { useContext } from "../../context";
import { type FeatureProps, toColor, toTimeInterval } from "../../utils";
import type { EdgeEventCallback } from "../Edge";
import type { PointEventCallback } from "../ScalePoints";
import { computeMouseMoveAmount, updateTrs } from "../utils";

export const useHooks = ({
  property,
  geometry,
  sceneProperty,
  feature,
}: Pick<FeatureProps<Property>, "property" | "sceneProperty" | "geometry" | "feature">) => {
  const { viewer } = useCesium();
  const ctx = useContext();
  const {
    fillColor,
    outlineColor,
    activeOutlineColor,
    outlineWidth,
    draggableOutlineColor,
    activeDraggableOutlineColor,
    draggableOutlineWidth,
    pointFillColor,
    pointOutlineColor,
    activePointOutlineColor,
    axisLineColor,
    cursor,
  } = property ?? {};
  const { allowEnterGround } = sceneProperty?.default || {};

  const [terrainHeightEstimate, setTerrainHeightEstimate] = useState(0);
  const [trs] = useState(() =>
    updateTrs(
      new TranslationRotationScale(),
      property,
      terrainHeightEstimate,
      geometry,
      allowEnterGround,
    ),
  );

  const inProgressSamplingTerrainHeight = useRef(false);
  const updateTerrainHeight = useCallback(() => {
    if (inProgressSamplingTerrainHeight.current) {
      return;
    }

    if (!allowEnterGround) {
      inProgressSamplingTerrainHeight.current = true;
      sampleTerrainHeightFromCartesian(viewer.scene, trs.translation).then(v => {
        setTerrainHeightEstimate(v ?? 0);
        inProgressSamplingTerrainHeight.current = false;
      });
    }
  }, [allowEnterGround, viewer, trs]);

  useEffect(() => {
    updateTrs(trs, property, terrainHeightEstimate, geometry, allowEnterGround);
    updateTerrainHeight();
  }, [
    property,
    geometry,
    trs,
    viewer,
    terrainHeightEstimate,
    updateTerrainHeight,
    allowEnterGround,
  ]);

  const style = useMemo(
    () => ({
      fillColor: toColor(fillColor),
      outlineColor: toColor(outlineColor),
      activeOutlineColor: toColor(activeOutlineColor),
      draggableOutlineColor: toColor(draggableOutlineColor),
      activeDraggableOutlineColor: toColor(activeDraggableOutlineColor),
      outlineWidth,
      draggableOutlineWidth,
      fill: !!fillColor,
      outline: !!outlineColor,
    }),
    [
      fillColor,
      outlineColor,
      activeOutlineColor,
      outlineWidth,
      draggableOutlineWidth,
      draggableOutlineColor,
      activeDraggableOutlineColor,
    ],
  );

  const scalePointStyle = useMemo(
    () => ({
      pointFillColor: toColor(pointFillColor) ?? style.fillColor,
      pointOutlineColor: toColor(pointOutlineColor) ?? style.outlineColor,
      activePointOutlineColor: toColor(activePointOutlineColor) ?? style.outlineColor,
      axisLineColor: toColor(axisLineColor) ?? style.outlineColor,
    }),
    [pointFillColor, pointOutlineColor, axisLineColor, style, activePointOutlineColor],
  );

  // ScalePoint event handlers
  const currentPointIndex = useRef<number>();
  const handlePointMouseDown: PointEventCallback = useCallback((_, { index }) => {
    currentPointIndex.current = index;
  }, []);
  const prevMousePosition2dForPoint = useRef<Cartesian2>();
  const handlePointMouseMove: PointEventCallback = useCallback(
    (e, { position, oppositePosition, pointLocal, index, layerId }) => {
      if (currentPointIndex.current !== index || !position || !oppositePosition || !pointLocal) {
        return;
      }

      const mousePosition = e.startPosition;
      if (prevMousePosition2dForPoint.current === undefined) {
        prevMousePosition2dForPoint.current = new Cartesian2(mousePosition.x, mousePosition.y);
        return;
      }

      const currentMousePosition2d = new Cartesian2(mousePosition.x, mousePosition.y);

      const axisVector = Cartesian3.subtract(position, oppositePosition, new Cartesian3());
      const length = Cartesian3.magnitude(axisVector);
      const scaleDirection = Cartesian3.normalize(axisVector, new Cartesian3());

      const { scaleAmount, pixelLengthAfterScaling } = computeMouseMoveAmount(
        viewer.scene,
        {
          startPosition: prevMousePosition2dForPoint.current,
          endPosition: currentMousePosition2d,
        },
        position,
        scaleDirection,
        length,
      );

      prevMousePosition2dForPoint.current = currentMousePosition2d.clone();

      const axisLocal = Cartesian3.normalize(pointLocal, new Cartesian3());
      const xDot = Math.abs(Cartesian3.dot(new Cartesian3(1, 0, 0), axisLocal));
      const yDot = Math.abs(Cartesian3.dot(new Cartesian3(0, 1, 0), axisLocal));
      const zDot = Math.abs(Cartesian3.dot(new Cartesian3(0, 0, 1), axisLocal));

      const isProportionalScaling = xDot && yDot && zDot;

      // When downscaling, stop at 20px length.
      if (scaleAmount < 0) {
        const isDiagonal = axisLocal.x && axisLocal.y && axisLocal.y;
        const pixelSideLengthAfterScaling = isDiagonal
          ? pixelLengthAfterScaling / Math.sqrt(2)
          : pixelLengthAfterScaling;
        if (pixelSideLengthAfterScaling < 20) {
          // Do nothing if scaling down will make the box smaller than 20px
          return;
        }
      }

      // Compute scale components along xyz
      const scaleStep = Cartesian3.multiplyByScalar(
        // Taking abs because scaling step is independent of axis direction
        // Scaling step is negative when scaling down and positive when scaling up
        Cartesian3.abs(
          // Extract scale components along the axis
          Cartesian3.multiplyComponents(
            trs.scale,
            // For proportional scaling we scale equally along xyz
            isProportionalScaling ? new Cartesian3(1, 1, 1) : axisLocal,
            new Cartesian3(),
          ),
          new Cartesian3(),
        ),
        scaleAmount,
        new Cartesian3(),
      );

      // Move the box by half the scale amount in the direction of scaling so
      // that the opposite end remains stationary.
      const moveStep = Cartesian3.multiplyByScalar(axisVector, scaleAmount / 2, new Cartesian3());

      // Prevent scaling in Z axis if it will result in the box going underground.
      const isDraggingBottomScalePoint = axisLocal.z < 0;
      const isUpscaling = scaleAmount > 0;
      if (!allowEnterGround && isUpscaling && isDraggingBottomScalePoint) {
        const boxCenterHeight = Cartographic.fromCartesian(
          trs.translation,
          undefined,
          new Cartographic(),
        ).height;
        const bottomHeight = boxCenterHeight - trs.scale.z / 2;
        const bottomHeightAfterScaling = bottomHeight - Math.abs(moveStep.z);
        if (bottomHeightAfterScaling < 0) {
          scaleStep.z = 0;
        }
      }

      const nextScale = new Cartesian3();
      const nextTranslation = new Cartesian3();

      Cartesian3.add(trs.scale, scaleStep, nextScale);
      Cartesian3.add(trs.translation, moveStep, nextTranslation);

      const cartographic = viewer?.scene.globe.ellipsoid.cartesianToCartographic(
        nextTranslation,
      ) as Cartographic;

      ctx?.onLayerEdit?.({
        layerId,
        scale: {
          width: nextScale.x,
          length: nextScale.y,
          height: nextScale.z,
          location: {
            lat: CesiumMath.toDegrees(cartographic?.latitude),
            lng: CesiumMath.toDegrees(cartographic?.longitude),
            height: cartographic?.height,
          },
        },
      });
    },
    [trs, viewer, allowEnterGround, ctx],
  );
  const handlePointMouseUp: PointEventCallback = useCallback(() => {
    currentPointIndex.current = undefined;
    prevMousePosition2dForPoint.current = undefined;
  }, []);

  // Edge event handlers
  const currentEdgeIndex = useRef<number>();
  const handleEdgeMouseDown: EdgeEventCallback = useCallback((_, { index }) => {
    currentEdgeIndex.current = index;
  }, []);
  const prevMouseXAxisForEdge = useRef<number>();
  const handleEdgeMouseMove: EdgeEventCallback = useCallback(
    (e, { index, layerId }) => {
      if (currentEdgeIndex.current !== index) {
        return;
      }

      const mousePosition = e.startPosition;
      if (prevMouseXAxisForEdge.current === undefined) {
        prevMouseXAxisForEdge.current = mousePosition.x;
        return;
      }

      const dx = mousePosition.x - prevMouseXAxisForEdge.current;
      prevMouseXAxisForEdge.current = mousePosition.x;
      const sensitivity = 0.05;
      const hpr = new HeadingPitchRoll(0, 0, 0);
      // -dx because the screen coordinates is opposite to local coordinates space.
      hpr.heading = -dx * sensitivity;
      hpr.pitch = 0;
      hpr.roll = 0;

      const nextRotation = new Quaternion();

      Quaternion.multiply(trs.rotation, Quaternion.fromHeadingPitchRoll(hpr), nextRotation);

      const { heading, pitch, roll } = HeadingPitchRoll.fromQuaternion(nextRotation);

      ctx?.onLayerEdit?.({
        layerId,
        rotate: {
          heading,
          pitch,
          roll,
        },
      });
    },
    [trs, ctx],
  );
  const handleEdgeMouseUp: EdgeEventCallback = useCallback(() => {
    currentEdgeIndex.current = undefined;
    prevMouseXAxisForEdge.current = undefined;
  }, []);

  useEffect(() => {
    document.body.style.cursor = cursor || "default";
  }, [cursor]);

  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);

  return {
    style,
    trs,
    scalePointStyle,
    availability,
    handlePointMouseDown,
    handlePointMouseMove,
    handlePointMouseUp,
    handleEdgeMouseDown,
    handleEdgeMouseMove,
    handleEdgeMouseUp,
  };
};
