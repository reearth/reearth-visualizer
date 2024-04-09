import { memo, forwardRef, CSSProperties, type Ref, type PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { styled } from "@reearth/services/theme";

import { BuiltinWidgets, InteractionModeType } from "../../../features/Visualizer/Crust";
import { ComputedFeature } from "../mantle";
import Map, {
  type SceneProperty,
  type Layer,
  type LayerSelectionReason,
  type Camera,
  type LatLng,
  type Cluster,
  type ComputedLayer,
} from "../Map";
import { Ref as MapRef } from "../Map";
import { SketchFeature, SketchType } from "../Map/Sketch/types";

import { VisualizerProvider } from "./context";
import coreContext from "./coreContext";
import DropHolder from "./DropHolder";
import { engines, type EngineType } from "./engines";
import Err from "./Error";
import useHooks from "./hooks";

export type {
  Alignment,
  Location,
  ValueTypes,
  ValueType,
  WidgetAlignSystem,
  WidgetLayoutConstraint,
} from "../../../features/Visualizer/Crust";
export type { EngineType } from "./engines";
export type { Viewport } from "./useViewport";

export { useVisualizer, type Context as VisualizerContext } from "./context";

export type CoreVisualizerProps = {
  engine?: EngineType;
  isBuilt?: boolean;
  isEditable?: boolean;
  rootLayerId?: string;
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  sceneProperty?: SceneProperty;
  layers?: Layer[];
  clusters?: Cluster[]; // TODO: remove completely from beta core
  camera?: Camera;
  interactionMode?: InteractionModeType;
  meta?: Record<string, unknown>;
  style?: CSSProperties;
  small?: boolean;
  ready?: boolean;
  hiddenLayers?: string[];
  zoomedLayerId?: string;
  onCameraChange?: (camera: Camera) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
  onLayerSelect?: (
    layerId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    feature: ComputedFeature | undefined,
    reason: LayerSelectionReason | undefined,
  ) => void;
  onZoomToLayer?: (layerId: string | undefined) => void;
  onMount?: () => void;
  onSketchTypeChangeProp?: (type: SketchType | undefined) => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  onInteractionModeChange?: (mode: InteractionModeType) => void;
};

const CoreVisualizer = memo(
  forwardRef<MapRef, PropsWithChildren<CoreVisualizerProps>>(
    (
      {
        engine,
        isBuilt,
        isEditable,
        rootLayerId,
        sceneProperty,
        layers,
        clusters,
        ownBuiltinWidgets,
        small,
        ready,
        hiddenLayers,
        camera: initialCamera,
        interactionMode,
        meta,
        style,
        zoomedLayerId,
        children,
        onLayerDrop,
        onLayerSelect,
        onCameraChange,
        onZoomToLayer,
        onInteractionModeChange,
        onMount,
        onSketchTypeChangeProp,
        onSketchFeatureCreate,
      },
      ref: Ref<MapRef | null>,
    ) => {
      const {
        mapRef,
        wrapperRef,
        selectedFeature,
        camera,
        featureFlags,
        overriddenSceneProperty,
        isDroppable,
        isLayerDragging,
        shouldRender,
        timelineManagerRef,
        cursor,
        cameraForceHorizontalRoll,
        coreContextValue,
        handleLayerSelect,
        handleLayerDrag,
        handleLayerDrop,
        handleLayerEdit,
        handleCameraChange,
        handleInteractionModeChange,
        handleSketchPluginFeatureCreate,
        handleSketchTypeChange,
        handleLayerVisibility,
        handleLayerLoad,
        handleLayerSelectWithRectStart,
        handleLayerSelectWithRectMove,
        handleLayerSelectWithRectEnd,
      } = useHooks(
        {
          rootLayerId,
          isEditable,
          camera: initialCamera,
          interactionMode,
          sceneProperty,
          zoomedLayerId,
          ownBuiltinWidgets,
          onLayerSelect,
          onCameraChange,
          onZoomToLayer,
          onLayerDrop,
          onInteractionModeChange,
          onSketchTypeChangeProp,
        },
        ref,
      );

      return (
        <ErrorBoundary FallbackComponent={Err}>
          <VisualizerProvider mapRef={mapRef}>
            <Filled ref={wrapperRef}>
              {isDroppable && <DropHolder />}
              <Map
                ref={mapRef}
                isBuilt={isBuilt}
                isEditable={isEditable}
                engine={engine}
                layers={layers}
                engines={engines}
                camera={camera}
                cameraForceHorizontalRoll={cameraForceHorizontalRoll}
                clusters={clusters}
                hiddenLayers={hiddenLayers}
                isLayerDragging={isLayerDragging}
                isLayerDraggable={isEditable}
                meta={meta}
                style={style}
                featureFlags={featureFlags}
                shouldRender={shouldRender}
                property={overriddenSceneProperty}
                small={small}
                ready={ready}
                timelineManagerRef={timelineManagerRef}
                interactionMode={interactionMode}
                selectedFeature={selectedFeature}
                cursor={cursor}
                onCameraChange={handleCameraChange}
                onLayerDrag={handleLayerDrag}
                onLayerDrop={handleLayerDrop}
                onLayerSelect={handleLayerSelect}
                onLayerEdit={handleLayerEdit}
                overrideInteractionMode={handleInteractionModeChange}
                onSketchFeatureCreate={onSketchFeatureCreate}
                onSketchPluginFeatureCreate={handleSketchPluginFeatureCreate}
                onSketchTypeChange={handleSketchTypeChange}
                onMount={onMount}
                onLayerVisibility={handleLayerVisibility}
                onLayerLoad={handleLayerLoad}
                onLayerSelectWithRectStart={handleLayerSelectWithRectStart}
                onLayerSelectWithRectMove={handleLayerSelectWithRectMove}
                onLayerSelectWithRectEnd={handleLayerSelectWithRectEnd}
              />
            </Filled>
            <coreContext.Provider value={coreContextValue}>{children}</coreContext.Provider>
          </VisualizerProvider>
        </ErrorBoundary>
      );
    },
  ),
);

export default CoreVisualizer;

const Filled = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;
