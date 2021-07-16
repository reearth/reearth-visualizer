import React, { forwardRef } from "react";
import {
  Viewer,
  Globe,
  Fog,
  Sun,
  SkyAtmosphere,
  ImageryLayer,
  Scene,
  CameraFlyTo,
  SkyBox,
  ScreenSpaceEventHandler,
  ScreenSpaceEvent,
} from "resium";
import { ScreenSpaceEventType } from "cesium";

import { styled } from "@reearth/theme";
import { SceneProperty, Camera } from "@reearth/util/value";
import Loading from "@reearth/components/atoms/Loading";
import PluginPrimitive from "../plugin/PluginPrimitive";
import PluginWidget from "../plugin/PluginWidget";
import { Provider } from "./api";
import useHooks, { Ref as RefType } from "./hooks";

export type Layer = {
  id: string;
  pluginId: string;
  extensionId: string;
  property?: any;
  pluginProperty?: any;
  isVisible?: boolean;
  title: string;
};

export type Widget = {
  pluginId: string;
  extensionId: string;
  property?: any;
  pluginProperty?: any;
  enabled?: boolean;
};

export type Props = {
  className?: string;
  onEntitySelect?: (id?: string) => void;
  selectedEntityId?: string;
  isEditable?: boolean;
  layers?: Layer[];
  widgets?: Widget[];
  property?: SceneProperty;
  isCapturing?: boolean;
  camera?: Camera;
  onCameraChange?: (camera: Camera) => void;
  small?: boolean;
  initialLoad?: boolean;
};

export type Ref = RefType;

const creditContainer = document.createElement("div");

const Cesium: React.ForwardRefRenderFunction<Ref, Props> = (
  {
    className,
    onEntitySelect,
    selectedEntityId,
    isEditable,
    widgets,
    layers,
    property,
    isCapturing,
    camera: cameraState,
    onCameraChange,
    small,
    initialLoad,
  },
  ref,
) => {
  const {
    ready,
    cameraDest,
    cameraOrientation,
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selected,
    selectEntity,
    selectViewerEntity,
  } = useHooks({
    initialLoad,
    selectedEntityId,
    property,
    isCapturing,
    camera: cameraState,
    ref,
    onEntitySelect,
    onCameraChange,
  });

  return !ready ? (
    <Loading />
  ) : (
    <StyledViewer
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
      requestRenderMode
      maximumRenderTimeChange={Infinity}
      creditContainer={creditContainer}
      small={small}
      onClick={selectViewerEntity}>
      <Provider layers={layers} onEntitySelect={selectEntity}>
        <ScreenSpaceEventHandler useDefault>
          {/* Disable default events */}
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_DOUBLE_CLICK} />
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_CLICK} />
        </ScreenSpaceEventHandler>
        {cameraDest && cameraOrientation && (
          <CameraFlyTo destination={cameraDest} orientation={cameraOrientation} duration={0} once />
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
          terrainProvider={terrainProvider}
          enableLighting={!!property?.atmosphere?.enable_lighting}
          showGroundAtmosphere={property?.atmosphere?.ground_atmosphere ?? true}
          atmosphereSaturationShift={property?.atmosphere?.surturation_shift}
          atmosphereHueShift={property?.atmosphere?.hue_shift}
          atmosphereBrightnessShift={property?.atmosphere?.brightness_shift}
        />
        {imageryLayers?.map(([id, im, min, max]) => (
          <ImageryLayer
            key={id}
            imageryProvider={im}
            minimumTerrainLevel={min}
            maximumTerrainLevel={max}
          />
        ))}
        {widgets
          ?.filter(w => w.enabled)
          .map(w => (
            <PluginWidget
              key={w.pluginId + w.extensionId}
              pluginId={w.pluginId}
              extensionId={w.extensionId}
              isBuilt={!isEditable}
              isEditable={isEditable}
              property={w.property}
              pluginProperty={w.pluginProperty}
              sceneProperty={property}
              selected={selected}
            />
          ))}
        {layers?.map(layer => (
          <PluginPrimitive
            key={layer.id}
            id={layer.id}
            pluginId={layer.pluginId}
            extensionId={layer.extensionId}
            property={layer.property}
            pluginProperty={layer.pluginProperty}
            sceneProperty={property}
            isBuilt={!isEditable}
            isEditable={isEditable}
            isEditing={selectedEntityId === layer.id}
            isVisible={layer.isVisible}
            selected={selected}
            isSelected={!!selected[0] && selected[0] === layer.id}
            onClick={() => selectEntity?.(layer.id)}
          />
        ))}
      </Provider>
    </StyledViewer>
  );
};

const StyledViewer = styled(Viewer)<{ small?: boolean }>`
  width: ${({ small }) => (small ? "300px" : "auto")};
  height: ${({ small }) => (small ? "300px" : "100%")};
`;

export default forwardRef(Cesium);
