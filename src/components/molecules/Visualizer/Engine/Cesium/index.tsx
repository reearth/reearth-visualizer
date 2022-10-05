import { ArcType, Color, ScreenSpaceEventType } from "cesium";
import React, { forwardRef } from "react";
import {
  Viewer,
  Globe,
  Fog,
  Sun,
  SkyAtmosphere,
  Scene,
  SkyBox,
  Camera,
  ScreenSpaceEventHandler,
  ScreenSpaceEvent,
  ScreenSpaceCameraController,
  Entity,
  PolylineGraphics,
} from "resium";

import type { EngineProps, Ref as EngineRef } from "..";

import Clock from "./core/Clock";
import ImageryLayers from "./core/Imagery";
import Indicator from "./core/Indicator";
import Event from "./Event";
import useHooks from "./hooks";

export type { EngineProps as Props } from "..";

const Cesium: React.ForwardRefRenderFunction<EngineRef, EngineProps> = (
  {
    className,
    style,
    property,
    camera,
    clock,
    small,
    ready,
    children,
    selectedLayerId,
    isLayerDraggable,
    isLayerDragging,
    shouldRender,
    onLayerSelect,
    onCameraChange,
    onTick,
    onLayerDrag,
    onLayerDrop,
  },
  ref,
) => {
  const {
    terrainProvider,
    terrainProperty,
    backgroundColor,
    cesium,
    cameraViewBoundaries,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraChange,
    handleCameraMoveEnd,
    handleTick,
    mouseEventHandles,
  } = useHooks({
    ref,
    property,
    camera,
    clock,
    selectedLayerId,
    onLayerSelect,
    onCameraChange,
    onTick,
    onLayerDrag,
    onLayerDrop,
    isLayerDraggable,
  });

  return (
    <Viewer
      ref={cesium}
      className={className}
      animation
      timeline
      fullscreenButton={false}
      homeButton={false}
      geocoder={false}
      infoBox={false}
      imageryProvider={false}
      baseLayerPicker={false}
      navigationHelpButton={false}
      projectionPicker={false}
      sceneModePicker={false}
      creditContainer={creditContainer}
      style={{
        width: small ? "300px" : "auto",
        height: small ? "300px" : "100%",
        display: ready ? undefined : "none",
        cursor: isLayerDragging ? "grab" : undefined,
        ...style,
      }}
      requestRenderMode={!property?.timeline?.animation && !isLayerDraggable && !shouldRender}
      maximumRenderTimeChange={
        !property?.timeline?.animation && !isLayerDraggable && !shouldRender ? Infinity : undefined
      }
      shadows={!!property?.atmosphere?.shadows}
      onClick={handleClick}
      onDoubleClick={mouseEventHandles.doubleclick}
      onMouseDown={mouseEventHandles.mousedown}
      onMouseUp={mouseEventHandles.mouseup}
      onRightClick={mouseEventHandles.rightclick}
      onRightDown={mouseEventHandles.rightdown}
      onRightUp={mouseEventHandles.rightup}
      onMiddleClick={mouseEventHandles.middleclick}
      onMiddleDown={mouseEventHandles.middledown}
      onMiddleUp={mouseEventHandles.middleup}
      onMouseMove={mouseEventHandles.mousemove}
      onMouseEnter={mouseEventHandles.mouseenter}
      onMouseLeave={mouseEventHandles.mouseleave}
      onWheel={mouseEventHandles.wheel}>
      <Event onMount={handleMount} onUnmount={handleUnmount} />
      <Clock property={property} onTick={handleTick} />
      <ImageryLayers tiles={property?.tiles} cesiumIonAccessToken={property?.default?.ion} />
      <Entity>
        <Indicator property={property} />
      </Entity>
      <ScreenSpaceEventHandler useDefault>
        {/* remove default click event */}
        <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_CLICK} />
        {/* remove default double click event */}
        <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_DOUBLE_CLICK} />
      </ScreenSpaceEventHandler>
      <ScreenSpaceCameraController
        maximumZoomDistance={
          property?.cameraLimiter?.cameraLimitterEnabled
            ? property.cameraLimiter?.cameraLimitterTargetArea?.height ?? Number.POSITIVE_INFINITY
            : Number.POSITIVE_INFINITY
        }
      />
      <Camera
        onChange={handleCameraChange}
        percentageChanged={0.2}
        onMoveEnd={handleCameraMoveEnd}
      />
      {cameraViewBoundaries && property?.cameraLimiter?.cameraLimitterShowHelper && (
        <Entity>
          <PolylineGraphics
            positions={cameraViewBoundaries}
            width={1}
            material={Color.RED}
            arcType={ArcType.RHUMB}
          />
        </Entity>
      )}
      {cameraViewOuterBoundaries && property?.cameraLimiter?.cameraLimitterShowHelper && (
        <Entity>
          <PolylineGraphics
            positions={cameraViewOuterBoundaries}
            width={1}
            material={cameraViewBoundariesMaterial}
            arcType={ArcType.RHUMB}
          />
        </Entity>
      )}
      <Scene backgroundColor={backgroundColor} />
      <SkyBox show={property?.default?.skybox ?? true} />
      <Fog
        enabled={property?.atmosphere?.fog ?? true}
        density={property?.atmosphere?.fog_density}
      />
      <Sun show={property?.atmosphere?.enable_sun ?? true} />
      <SkyAtmosphere show={property?.atmosphere?.sky_atmosphere ?? true} />
      <Globe
        enableLighting={!!property?.atmosphere?.enable_lighting}
        showGroundAtmosphere={property?.atmosphere?.ground_atmosphere ?? true}
        atmosphereSaturationShift={property?.atmosphere?.surturation_shift}
        atmosphereHueShift={property?.atmosphere?.hue_shift}
        atmosphereBrightnessShift={property?.atmosphere?.brightness_shift}
        terrainProvider={terrainProvider}
        depthTestAgainstTerrain={!!terrainProperty.depthTestAgainstTerrain}
        terrainExaggerationRelativeHeight={terrainProperty.terrainExaggerationRelativeHeight}
        terrainExaggeration={terrainProperty.terrainExaggeration}
      />
      {ready ? children : null}
    </Viewer>
  );
};

const creditContainer = document.createElement("div");

export default forwardRef(Cesium);
