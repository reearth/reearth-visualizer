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
} from "resium";
import { ScreenSpaceEventType } from "cesium";

import Loading from "@reearth/components/atoms/Loading";
import useHooks from "./hooks";
import CameraFlyTo from "./CameraFlyTo";
import type { EngineProps, Ref as EngineRef } from "..";

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
    selectedPrimitiveId,
    onPrimitiveSelect,
    onCameraChange,
  },
  ref,
) => {
  const {
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
    onCameraMoveEnd,
  } = useHooks({
    ref,
    property,
    camera,
    selectedPrimitiveId,
    onPrimitiveSelect,
    onCameraChange,
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
          ...style,
        }}
        requestRenderMode={!property?.timeline?.animation}
        maximumRenderTimeChange={property?.timeline?.animation ? undefined : Infinity}
        shadows={!!property?.atmosphere?.shadows}>
        <Clock shouldAnimate={!!property?.timeline?.animation} />
        <ScreenSpaceEventHandler useDefault>
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_CLICK} action={selectViewerEntity} />
          {/* remove default double click event */}
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_DOUBLE_CLICK} />
        </ScreenSpaceEventHandler>
        <Camera onMoveEnd={onCameraMoveEnd} />
        <CameraFlyTo camera={camera} duration={0} />
        <Scene backgroundColor={backgroundColor} />
        <SkyBox show={property?.default?.skybox ?? true} />
        <Fog
          enabled={property?.atmosphere?.fog ?? true}
          density={property?.atmosphere?.fog_density}
        />
        <Sun show={property?.atmosphere?.enable_sun ?? true} />
        <SkyAtmosphere show={property?.atmosphere?.sky_atmosphere ?? true} />
        <Globe
          terrainProvider={terrainProvider}
          depthTestAgainstTerrain={!!property?.default?.depthTestAgainstTerrain}
          enableLighting={!!property?.atmosphere?.enable_lighting}
          showGroundAtmosphere={property?.atmosphere?.ground_atmosphere ?? true}
          atmosphereSaturationShift={property?.atmosphere?.surturation_shift}
          atmosphereHueShift={property?.atmosphere?.hue_shift}
          atmosphereBrightnessShift={property?.atmosphere?.brightness_shift}
          {...{
            // TODO: update resium
            terrainExaggeration: property?.default?.terrainExaggeration,
            terrainExaggerationRelativeHeight: property?.default?.terrainExaggerationRelativeHeight,
          }}
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
      {!ready && <Loading />}
    </>
  );
};

const creditContainer = document.createElement("div");

export default forwardRef(Cesium);
