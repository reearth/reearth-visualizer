import { ArcType, Color, ScreenSpaceEventType } from "cesium";
import React, { forwardRef } from "react";
import {
  Viewer,
  Clock,
  Globe,
  Fog,
  Sun,
  SkyAtmosphere,
  ImageryLayer,
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

import Event from "./Event";
import useHooks from "./hooks";

export type { EngineProps as Props } from "..";

const Cesium: React.ForwardRefRenderFunction<EngineRef, EngineProps> = (
  {
    className,
    style,
    property,
    camera,
    small,
    ready,
    children,
    selectedLayerId,
    isLayerDraggable,
    isLayerDragging,
    onLayerSelect,
    onCameraChange,
    onLayerDrag,
    onLayerDrop,
  },
  ref,
) => {
  const {
    terrainProvider,
    terrainProperty,
    backgroundColor,
    imageryLayers,
    cesium,
    limiterDimensions,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraMoveEnd,
  } = useHooks({
    ref,
    property,
    camera,
    selectedLayerId,
    onLayerSelect,
    onCameraChange,
    onLayerDrag,
    onLayerDrop,
    isLayerDraggable,
  });

  return (
    <>
      <Viewer
        ref={cesium}
        className={className}
        animation={false}
        timeline={false}
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
        requestRenderMode={!property?.timeline?.animation && !isLayerDraggable}
        maximumRenderTimeChange={
          !property?.timeline?.animation && !isLayerDraggable ? Infinity : undefined
        }
        shadows={!!property?.atmosphere?.shadows}
        onClick={handleClick}>
        <Event onMount={handleMount} onUnmount={handleUnmount} />
        <Clock shouldAnimate={!!property?.timeline?.animation} />
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
          }></ScreenSpaceCameraController>
        <Camera
          onChange={handleCameraMoveEnd}
          percentageChanged={property?.cameraLimiter?.cameraLimitterEnabled ? 0.2 : 0.5}
        />

        {limiterDimensions && property?.cameraLimiter?.cameraLimitterShowHelper && (
          <Entity>
            <PolylineGraphics
              positions={limiterDimensions.cartesianArray}
              width={1}
              material={Color.RED}
              arcType={ArcType.RHUMB}></PolylineGraphics>
          </Entity>
        )}
        {cameraViewOuterBoundaries && property?.cameraLimiter?.cameraLimitterShowHelper && (
          <Entity>
            <PolylineGraphics
              positions={cameraViewOuterBoundaries}
              width={1}
              material={cameraViewBoundariesMaterial}
              arcType={ArcType.RHUMB}></PolylineGraphics>
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
        {imageryLayers?.map(([id, im, min, max]) => (
          <ImageryLayer
            key={id}
            imageryProvider={im}
            minimumTerrainLevel={min}
            maximumTerrainLevel={max}
          />
        ))}
        {ready ? children : null}
      </Viewer>
    </>
  );
};

const creditContainer = document.createElement("div");

export default forwardRef(Cesium);
