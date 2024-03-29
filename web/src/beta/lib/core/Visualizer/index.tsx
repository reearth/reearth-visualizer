import { memo, forwardRef, CSSProperties, type Ref, type PropsWithChildren, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import Crust, {
  type Alignment,
  type Location,
  type WidgetAlignSystem,
  type WidgetLayoutConstraint,
  type ExternalPluginProps,
  type InternalWidget,
  WidgetAreaType,
  BuiltinWidgets,
  InteractionModeType,
} from "../Crust";
import { InstallableInfoboxBlock } from "../Crust/Infobox";
import { ComputedFeature, Tag } from "../mantle";
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
import { Position } from "../StoryPanel/types";

import { VisualizerProvider } from "./context";
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
} from "../Crust";
export type { EngineType } from "./engines";
export type { Viewport } from "./useViewport";

export { useVisualizer, type Context as VisualizerContext } from "./context";

export type Props = {
  engine?: EngineType;
  isBuilt?: boolean;
  isEditable?: boolean;
  inEditor?: boolean;
  rootLayerId?: string;
  widgetAlignSystem?: WidgetAlignSystem;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  widgetAlignSystemEditing?: boolean;
  floatingWidgets?: InternalWidget[];
  sceneProperty?: SceneProperty;
  layers?: Layer[];
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  clusters?: Cluster[]; // TODO: remove completely from beta core
  camera?: Camera;
  storyPanelPosition?: Position;
  interactionMode?: InteractionModeType;
  meta?: Record<string, unknown>;
  style?: CSSProperties;
  small?: boolean;
  ready?: boolean;
  tags?: Tag[]; // TODO: remove completely from beta core
  useExperimentalSandbox?: boolean;
  selectedWidgetArea?: WidgetAreaType;
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
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignmentUpdate?: (location: Location, align: Alignment) => void;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
  onInfoboxBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined,
  ) => Promise<void>;
  onInfoboxBlockMove?: (id: string, targetIndex: number, layerId?: string) => Promise<void>;
  onInfoboxBlockDelete?: (id?: string) => Promise<void>;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
  onZoomToLayer?: (layerId: string | undefined) => void;
  onMount?: () => void;
  onSketchTypeChange?: (type: SketchType | undefined) => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  onInteractionModeChange?: (mode: InteractionModeType) => void;
} & ExternalPluginProps;

const Visualizer = memo(
  forwardRef<MapRef, PropsWithChildren<Props>>(
    (
      {
        engine,
        isBuilt,
        rootLayerId,
        isEditable,
        inEditor,
        sceneProperty,
        layers,
        installableInfoboxBlocks,
        clusters,
        widgetAlignSystem,
        widgetAlignSystemEditing,
        widgetLayoutConstraint,
        floatingWidgets,
        ownBuiltinWidgets,
        small,
        ready,
        tags,
        selectedWidgetArea,
        hiddenLayers,
        camera: initialCamera,
        interactionMode: initialInteractionMode,
        meta,
        style,
        pluginBaseUrl,
        pluginProperty,
        zoomedLayerId,
        useExperimentalSandbox,
        storyPanelPosition = "left",
        children: storyPanel,
        onLayerDrop,
        onLayerSelect,
        onCameraChange,
        onWidgetLayoutUpdate,
        onWidgetAlignmentUpdate,
        onWidgetAreaSelect,
        onInfoboxBlockCreate,
        onInfoboxBlockMove,
        onInfoboxBlockDelete,
        onPropertyUpdate,
        onPropertyItemAdd,
        onPropertyItemMove,
        onPropertyItemDelete,
        onZoomToLayer,
        onInteractionModeChange,
        onMount,
        onSketchTypeChange: onSketchTypeChangeProp,
        onSketchFeatureCreate,
      },
      ref: Ref<MapRef | null>,
    ) => {
      const {
        mapRef,
        wrapperRef,
        selectedLayer,
        selectedFeature,
        selectedComputedFeature,
        viewport,
        camera,
        interactionMode,
        featureFlags,
        isMobile,
        overriddenSceneProperty,
        isDroppable,
        infobox,
        isLayerDragging,
        shouldRender,
        timelineManagerRef,
        overrideSceneProperty,
        cursor,
        cameraForceHorizontalRoll,
        handleCameraForceHorizontalRollChange,
        handleLayerSelect,
        handleLayerDrag,
        handleLayerDrop,
        handleLayerEdit,
        onLayerEdit,
        handleCameraChange,
        handleInteractionModeChange,
        onPluginSketchFeatureCreated,
        handlePluginSketchFeatureCreated,
        onSketchTypeChange,
        handleSketchTypeChange,
        onLayerVisibility,
        handleLayerVisibility,
        onLayerLoad,
        handleLayerLoad,
        onLayerSelectWithRectStart,
        handleLayerSelectWithRectStart,
        onLayerSelectWithRectMove,
        handleLayerSelectWithRectMove,
        onLayerSelectWithRectEnd,
        handleLayerSelectWithRectEnd,
      } = useHooks(
        {
          rootLayerId,
          isEditable,
          camera: initialCamera,
          layers,
          interactionMode: initialInteractionMode,
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

      const selectedLayerIdForCrust = useMemo(
        () => ({ layerId: selectedLayer.layerId, featureId: selectedLayer.featureId }),
        [selectedLayer.featureId, selectedLayer.layerId],
      );

      return (
        <ErrorBoundary FallbackComponent={Err}>
          <Wrapper>
            <VisualizerProvider mapRef={mapRef}>
              {storyPanelPosition === "left" && storyPanel}
              <Filled ref={wrapperRef}>
                {isDroppable && <DropHolder />}
                <Crust
                  engineName={engine}
                  tags={tags}
                  viewport={viewport}
                  isBuilt={isBuilt}
                  isEditable={isEditable}
                  inEditor={inEditor}
                  sceneProperty={overriddenSceneProperty}
                  overrideSceneProperty={overrideSceneProperty}
                  infobox={infobox}
                  installableInfoboxBlocks={installableInfoboxBlocks}
                  camera={camera}
                  interactionMode={interactionMode}
                  overrideInteractionMode={handleInteractionModeChange}
                  isMobile={isMobile}
                  selectedWidgetArea={selectedWidgetArea}
                  selectedComputedLayer={selectedLayer?.layer}
                  selectedFeature={selectedFeature}
                  selectedComputedFeature={selectedComputedFeature}
                  selectedReason={selectedLayer.reason}
                  selectedLayerId={selectedLayerIdForCrust}
                  widgetAlignSystem={widgetAlignSystem}
                  widgetAlignSystemEditing={widgetAlignSystemEditing}
                  widgetLayoutConstraint={widgetLayoutConstraint}
                  floatingWidgets={floatingWidgets}
                  mapRef={mapRef}
                  externalPlugin={{ pluginBaseUrl, pluginProperty }}
                  useExperimentalSandbox={useExperimentalSandbox}
                  timelineManagerRef={timelineManagerRef}
                  onWidgetLayoutUpdate={onWidgetLayoutUpdate}
                  onWidgetAlignmentUpdate={onWidgetAlignmentUpdate}
                  onWidgetAreaSelect={onWidgetAreaSelect}
                  onInfoboxBlockCreate={onInfoboxBlockCreate}
                  onInfoboxBlockMove={onInfoboxBlockMove}
                  onInfoboxBlockDelete={onInfoboxBlockDelete}
                  onPropertyUpdate={onPropertyUpdate}
                  onPropertyItemAdd={onPropertyItemAdd}
                  onPropertyItemMove={onPropertyItemMove}
                  onPropertyItemDelete={onPropertyItemDelete}
                  onLayerEdit={onLayerEdit}
                  onPluginSketchFeatureCreated={onPluginSketchFeatureCreated}
                  onSketchTypeChange={onSketchTypeChange}
                  onLayerVisibility={onLayerVisibility}
                  onLayerLoad={onLayerLoad}
                  onLayerSelectWithRectStart={onLayerSelectWithRectStart}
                  onLayerSelectWithRectMove={onLayerSelectWithRectMove}
                  onLayerSelectWithRectEnd={onLayerSelectWithRectEnd}
                  onCameraForceHorizontalRollChange={handleCameraForceHorizontalRollChange}
                />
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
                  // overrides={overrides} // not used for now
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
                  onPluginSketchFeatureCreated={handlePluginSketchFeatureCreated}
                  onSketchTypeChange={handleSketchTypeChange}
                  onMount={onMount}
                  onLayerVisibility={handleLayerVisibility}
                  onLayerLoad={handleLayerLoad}
                  onLayerSelectWithRectStart={handleLayerSelectWithRectStart}
                  onLayerSelectWithRectMove={handleLayerSelectWithRectMove}
                  onLayerSelectWithRectEnd={handleLayerSelectWithRectEnd}
                />
              </Filled>
              {storyPanelPosition === "right" && storyPanel}
            </VisualizerProvider>
          </Wrapper>
        </ErrorBoundary>
      );
    },
  ),
);

export default Visualizer;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
`;

const Filled = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;
