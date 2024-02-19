import React, { memo } from "react";

import type {
  FeatureComponentConfig,
  FeatureProps,
} from "@reearth/beta/lib/core/engines/Cesium/Feature";
import type { BoxAppearance, LatLngHeight } from "@reearth/beta/lib/core/mantle";
import { LayerEditEvent } from "@reearth/beta/lib/core/Map";

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
    show = true,
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
    hideIndicator,
    disabledSelection,
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

  return !isVisible || !show ? null : (
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
          isActive={disabledSelection ? !!activeBox : false}
          activeOutlineColor={style.activeOutlineColor}
          trs={trs}
          availability={availability}
          distanceDisplayCondition={distanceDisplayCondition}
          hideIndicator={hideIndicator}
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
            isHovered={
              disabledSelection
                ? activeEdgeIndex === i || (!edge.isDraggable && !!activeBox)
                : false
            }
            width={
              edge.isDraggable && disabledSelection
                ? style.draggableOutlineWidth
                : style.outlineWidth
            }
            fillColor={edge.isDraggable ? style.draggableOutlineColor : style.outlineColor}
            hoverColor={
              disabledSelection
                ? edge.isDraggable
                  ? style.activeDraggableOutlineColor
                  : style.activeOutlineColor
                : undefined
            }
            trs={trs}
            onMouseDown={edge.isDraggable && disabledSelection ? handleEdgeMouseDown : undefined}
            onMouseMove={edge.isDraggable && disabledSelection ? handleEdgeMouseMove : undefined}
            onMouseUp={edge.isDraggable && disabledSelection ? handleEdgeMouseUp : undefined}
            availability={availability}
            distanceDisplayCondition={distanceDisplayCondition}
            hideIndicator={hideIndicator}
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
            isHovered={disabledSelection ? activeScalePointIndex === i : false}
            pointFillColor={disabledSelection ? scalePointStyle.pointFillColor : undefined}
            pointOutlineColor={disabledSelection ? scalePointStyle.pointOutlineColor : undefined}
            hoverPointOutlineColor={
              disabledSelection ? scalePointStyle.activePointOutlineColor : undefined
            }
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
            onPointMouseDown={disabledSelection ? handlePointMouseDown : undefined}
            onPointMouseMove={disabledSelection ? handlePointMouseMove : undefined}
            onPointMouseUp={disabledSelection ? handlePointMouseUp : undefined}
            availability={availability}
            distanceDisplayCondition={distanceDisplayCondition}
            hideIndicator={hideIndicator}
          />
        ))}
    </>
  );
});

export default Box;

export const config: FeatureComponentConfig = {
  noLayer: true,
};
