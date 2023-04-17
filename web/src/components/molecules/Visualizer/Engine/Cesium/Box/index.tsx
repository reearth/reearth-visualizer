import React, { memo } from "react";

import { LatLngHeight } from "@reearth/util/value";

import { SceneProperty } from "../..";
import type { Props as PrimitiveProps } from "../../../Primitive";

import { BOX_EDGES, SCALE_POINTS, SIDE_PLANES, SIDE_PLANE_NAMES } from "./constants";
import { Edge } from "./Edge";
import { useHooks } from "./hooks/box";
import { ScalePoints } from "./ScalePoints";
import { Side } from "./Side";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    location?: LatLngHeight;
    height?: number;
    width?: number;
    length?: number;
    heading?: number;
    pitch?: number;
    roll?: number;
    fillColor?: string;
    outlineColor?: string;
    activeOutlineColor?: string;
    outlineWidth?: number;
    draggableOutlineColor?: string;
    activeDraggableOutlineColor?: string;
    draggableOutlineWidth?: number;
    scalePoint?: boolean;
    axisLine?: boolean;
    pointFillColor?: string;
    pointOutlineColor?: string;
    activePointOutlineColor?: string;
    pointOutlineWidth?: number;
    axisLineColor?: string;
    axisLineWidth?: number;
    allowEnterGround?: boolean;
    cursor?: string;
    activeBox?: boolean;
    activeScalePointIndex?: number; // 0 ~ 11
    activeEdgeIndex?: number; // 0 ~ 11
  };
};

const Box: React.FC<PrimitiveProps<Property, any, SceneProperty>> = memo(function BoxPresenter({
  layer,
  sceneProperty,
}) {
  const { id, isVisible, property } = layer ?? {};
  const {
    height = 100,
    width = 100,
    length = 100,
    pointOutlineWidth,
    axisLineWidth,
    scalePoint = true,
    axisLine = true,
    activeBox,
    activeEdgeIndex,
    activeScalePointIndex,
  } = property?.default ?? {};
  const {
    style,
    trs,
    scalePointStyle,
    handlePointMouseDown,
    handlePointMouseMove,
    handlePointMouseUp,
    handleEdgeMouseDown,
    handleEdgeMouseMove,
    handleEdgeMouseUp,
  } = useHooks({ layer, sceneProperty });

  const scalePointDimension = ((width + height + length) / 3) * 0.05;

  return !isVisible ? null : (
    <>
      {SIDE_PLANES.map((plane, i) => (
        <Side
          key={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          id={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          planeLocal={plane}
          fill={style.fill}
          fillColor={style.fillColor}
          outlineColor={style.outlineColor}
          isActive={!!activeBox}
          activeOutlineColor={style.activeOutlineColor}
          trs={trs}
        />
      ))}
      {BOX_EDGES.map((edge, i) => {
        return (
          <Edge
            key={`${id}-edge-${i}`}
            id={`${id}-edge${edge.isDraggable ? `-draggable` : ""}-${i}`}
            index={i}
            edge={edge}
            isHovered={activeEdgeIndex === i || (!edge.isDraggable && !!activeBox)}
            width={edge.isDraggable ? style.draggableOutlineWidth : style.outlineWidth}
            fillColor={edge.isDraggable ? style.draggableOutlineColor : style.outlineColor}
            hoverColor={
              edge.isDraggable ? style.activeDraggableOutlineColor : style.activeOutlineColor
            }
            trs={trs}
            onMouseDown={edge.isDraggable ? handleEdgeMouseDown : undefined}
            onMouseMove={edge.isDraggable ? handleEdgeMouseMove : undefined}
            onMouseUp={edge.isDraggable ? handleEdgeMouseUp : undefined}
          />
        );
      })}
      {scalePoint &&
        SCALE_POINTS.map((vector, i) => (
          <ScalePoints
            key={`${id}-scale-point-${i}`}
            id={`${id}-scale-point`}
            index={i}
            scalePoint={vector}
            trs={trs}
            isHovered={activeScalePointIndex === i}
            pointFillColor={scalePointStyle.pointFillColor}
            pointOutlineColor={scalePointStyle.pointOutlineColor}
            hoverPointOutlineColor={scalePointStyle.activePointOutlineColor}
            pointOutlineWidth={pointOutlineWidth}
            axisLineColor={scalePointStyle.axisLineColor}
            axisLineWidth={axisLineWidth}
            dimensions={{
              width: scalePointDimension,
              height: scalePointDimension,
              length: scalePointDimension,
            }}
            visiblePoint={scalePoint}
            visibleAxisLine={axisLine && activeScalePointIndex === i}
            onPointMouseDown={handlePointMouseDown}
            onPointMouseMove={handlePointMouseMove}
            onPointMouseUp={handlePointMouseUp}
          />
        ))}
    </>
  );
});

export default Box;
