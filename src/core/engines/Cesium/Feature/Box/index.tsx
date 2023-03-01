import React, { memo } from "react";

import type { FeatureComponentConfig, FeatureProps } from "@reearth/core/engines/Cesium/Feature";
import type { BoxAppearance, LatLngHeight } from "@reearth/core/mantle";
import { LayerEditEvent } from "@reearth/core/Map";

import { BOX_EDGES, SCALE_POINTS, SIDE_PLANES, SIDE_PLANE_NAMES } from "./constants";
import { Edge } from "./Edge";
import { useHooks } from "./hooks/box";
import { ScalePoints } from "./ScalePoints";
import { Side } from "./Side";

export type Props = FeatureProps<Property> & { onLayerEdit?: (e: LayerEditEvent) => void };

export type Property = BoxAppearance & {
  // compat
  location?: LatLngHeight;
};

const Box: React.FC<Props> = memo(function BoxPresenter({
  property,
  geometry,
  isVisible,
  layer,
  feature,
  onLayerEdit,
}) {
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
  } = property ?? {};
  const {
    style,
    trs,
    scalePointStyle,
    availability,
    distanceDisplayCondition,
    handlePointMouseDown,
    handlePointMouseMove,
    handlePointMouseUp,
    handleEdgeMouseDown,
    handleEdgeMouseMove,
    handleEdgeMouseUp,
  } = useHooks({ property, geometry, feature, onLayerEdit });

  const scalePointDimension = ((width + height + length) / 3) * 0.05;

  const [layerId, featureId] = [layer?.id, feature?.id];

  return !isVisible ? null : (
    <>
      {SIDE_PLANES.map((plane, i) => (
        <Side
          key={`${layerId}-plane-${SIDE_PLANE_NAMES[i]}`}
          layerId={`${layerId}-plane-${SIDE_PLANE_NAMES[i]}`}
          featureId={`${featureId}-plane-${SIDE_PLANE_NAMES[i]}`}
          planeLocal={plane}
          fill={style.fill}
          fillColor={style.fillColor}
          outlineColor={style.outlineColor}
          isActive={!!activeBox}
          activeOutlineColor={style.activeOutlineColor}
          trs={trs}
          availability={availability}
          distanceDisplayCondition={distanceDisplayCondition}
        />
      ))}
      {BOX_EDGES.map((edge, i) => {
        return (
          <Edge
            key={`${layerId}-edge-${i}`}
            featureId={`${featureId}-edge${edge.isDraggable ? `-draggable` : ""}-${i}`}
            layerId={`${layerId}-edge${edge.isDraggable ? `-draggable` : ""}-${i}`}
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
            availability={availability}
            distanceDisplayCondition={distanceDisplayCondition}
          />
        );
      })}
      {scalePoint &&
        SCALE_POINTS.map((vector, i) => (
          <ScalePoints
            key={`${layerId}-scale-point-${i}`}
            layerId={`${layerId}-scale-point`}
            featureId={`${featureId}-scale-point`}
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
            availability={availability}
            distanceDisplayCondition={distanceDisplayCondition}
          />
        ))}
    </>
  );
});

export default Box;

export const config: FeatureComponentConfig = {
  noLayer: true,
};
