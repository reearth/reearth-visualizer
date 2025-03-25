import styled from "@emotion/styled";
import { ViewerProperty } from "@reearth/beta/features/Editor/Visualizer/type";
import {
  PhotoOverlayPreview,
  SketchFeatureTooltip
} from "@reearth/beta/utils/sketch";
import {
  Camera,
  LatLng,
  ValueType,
  ValueTypes
} from "@reearth/beta/utils/value";
import {
  type SketchFeature,
  type SketchType,
  type ComputedFeature,
  type ComputedLayer,
  type Layer,
  type EngineType,
  CoreVisualizer
} from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { config } from "@reearth/services/config";
import { WidgetAreaState } from "@reearth/services/state";
import { FC, MutableRefObject, SetStateAction } from "react";

import { VISUALIZER_CORE_DOM_ID } from "./constaints";
import Crust from "./Crust";
import { InstallableInfoboxBlock } from "./Crust/Infobox";
import { InstallableStoryBlock, StoryPanelRef } from "./Crust/StoryPanel";
import { Position, Story } from "./Crust/StoryPanel/types";
import { WidgetThemeOptions } from "./Crust/theme";
import { InteractionModeType, MapRef } from "./Crust/types";
import {
  Alignment,
  Widget,
  WidgetAlignSystem,
  WidgetLayoutConstraint
} from "./Crust/Widgets";
import type { Location } from "./Crust/Widgets";
import useHooks from "./hooks";

type VisualizerProps = {
  engine?: EngineType;
  engineMeta?: {
    cesiumIonAccessToken: string | undefined;
  };
  isBuilt?: boolean;
  inEditor?: boolean;
  ready?: boolean;
  layers?: Layer[];
  nlsLayers?: NLSLayer[];
  widgets?: {
    floating: (Omit<Widget, "layout" | "extended"> & {
      extended?: boolean;
    })[];
    alignSystem?: WidgetAlignSystem;
    ownBuiltinWidgets: string[];
    layoutConstraint?: Record<string, WidgetLayoutConstraint> | undefined;
  };
  viewerProperty?: ViewerProperty;
  pluginProperty?: Record<string, any> | undefined;
  story?: Story;
  zoomedLayerId?: string;
  visualizerRef?: MutableRefObject<MapRef | null>;
  currentCamera?: Camera;
  initialCamera?: Camera;
  interactionMode?: InteractionModeType;
  photoOverlayPreview?: PhotoOverlayPreview;
  sketchFeatureTooltip?: SketchFeatureTooltip;
  onCameraChange?: (camera: Camera) => void;
  onCoreLayerSelect?: (
    layerId: string | undefined,
    layer: ComputedLayer | undefined,
    feature: ComputedFeature | undefined
  ) => void;
  handleLayerDrop?: (
    layerId: string,
    propertyKey: string,
    position: LatLng | undefined
  ) => void;
  handleZoomToLayer?: (layerId: string | undefined) => void;
  handleSketchTypeChange?: (type: SketchType | undefined) => void;
  handleSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  handleSketchFeatureUpdate?: (feature: SketchFeature | null) => void;
  handleMount?: () => void;
  handleCoreAPIReady?: () => void;
  //
  widgetThemeOptions?: WidgetThemeOptions;
  widgetAlignEditorActivated?: boolean;
  selectedWidgetArea?: WidgetAreaState;
  handleWidgetUpdate?: (
    id: string,
    update: {
      location?: Location | undefined;
      extended?: boolean | undefined;
      index?: number | undefined;
    }
  ) => Promise<void>;
  handleWidgetAlignSystemUpdate?: (
    location: Location,
    align: Alignment
  ) => Promise<void>;
  selectWidgetArea?: (
    update?: SetStateAction<WidgetAreaState | undefined>
  ) => void;
  // infobox
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  handleInfoboxBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined
  ) => Promise<void>;
  handleInfoboxBlockMove?: (id: string, targetIndex: number) => Promise<void>;
  handleInfoboxBlockRemove?: (id?: string | undefined) => Promise<void>;
} & {
  showStoryPanel?: boolean;
  storyPanelRef?: MutableRefObject<StoryPanelRef | null>;
  installableStoryBlocks?: InstallableStoryBlock[];
  handleStoryPageChange?: (
    id?: string,
    disableScrollIntoView?: boolean
  ) => void;
  handleStoryBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined
  ) => Promise<void>;
  handleStoryBlockMove?: (
    id: string,
    targetId: number,
    blockId: string
  ) => void;
  handleStoryBlockDelete?: (
    pageId?: string | undefined,
    blockId?: string | undefined
  ) => Promise<void>;
  handlePropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  handlePropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  handlePropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  handlePropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
};

const Visualizer: FC<VisualizerProps> = ({
  engine,
  engineMeta,
  isBuilt,
  inEditor,
  ready,
  layers,
  nlsLayers,
  widgets,
  viewerProperty,
  pluginProperty,
  story,
  zoomedLayerId,
  visualizerRef,
  currentCamera,
  initialCamera,
  interactionMode,
  onCameraChange,
  onCoreLayerSelect,
  handleLayerDrop,
  handleZoomToLayer,
  handleSketchTypeChange,
  handleSketchFeatureCreate,
  handleSketchFeatureUpdate,
  handleMount,
  handleCoreAPIReady,
  // story
  showStoryPanel,
  storyPanelRef,
  installableStoryBlocks,
  handleStoryPageChange,
  handleStoryBlockCreate,
  handleStoryBlockDelete,
  handleStoryBlockMove,
  // widget
  widgetThemeOptions,
  widgetAlignEditorActivated,
  selectedWidgetArea,
  handleWidgetUpdate,
  handleWidgetAlignSystemUpdate,
  selectWidgetArea,
  // infobox
  installableInfoboxBlocks,
  handleInfoboxBlockCreate,
  handleInfoboxBlockMove,
  handleInfoboxBlockRemove,
  // story & infobox
  handlePropertyValueUpdate,
  handlePropertyItemAdd,
  handlePropertyItemMove,
  handlePropertyItemDelete,
  // photoOverlay
  photoOverlayPreview,
  //sketchLayer
  sketchFeatureTooltip
}) => {
  const {
    shouldRender,
    overriddenViewerProperty,
    overrideViewerProperty,
    storyWrapperRef,
    visualizerCamera,
    handleCoreLayerSelect,
    mapAPIReady,
    onCoreAPIReady,
    currentCameraRef
  } = useHooks({
    ownBuiltinWidgets: widgets?.ownBuiltinWidgets,
    viewerProperty,
    onCoreLayerSelect,
    currentCamera,
    handleCoreAPIReady
  });

  return (
    <Wrapper storyPanelPosition={story?.position}>
      <StoryWrapper ref={storyWrapperRef} />
      <CoreWrapper id={VISUALIZER_CORE_DOM_ID}>
        <CoreVisualizer
          ref={visualizerRef}
          engine={engine}
          isBuilt={!!isBuilt}
          isEditable={!isBuilt}
          layers={layers}
          zoomedLayerId={zoomedLayerId}
          viewerProperty={overriddenViewerProperty}
          ready={ready}
          meta={engineMeta}
          camera={visualizerCamera}
          interactionMode={interactionMode}
          shouldRender={shouldRender}
          displayCredits={false}
          onCameraChange={onCameraChange}
          onLayerSelect={handleCoreLayerSelect}
          onLayerDrop={handleLayerDrop}
          onZoomToLayer={handleZoomToLayer}
          onSketchTypeChangeProp={handleSketchTypeChange}
          onSketchFeatureCreate={handleSketchFeatureCreate}
          onSketchFeatureUpdate={handleSketchFeatureUpdate}
          onMount={handleMount}
          onAPIReady={onCoreAPIReady}
        >
          <Crust
            engineName={engine}
            isBuilt={!!isBuilt}
            isEditable={!isBuilt}
            inEditor={inEditor}
            mapRef={visualizerRef}
            mapAPIReady={mapAPIReady}
            layers={layers}
            // Viewer
            viewerProperty={overriddenViewerProperty}
            overrideViewerProperty={overrideViewerProperty}
            // Plugin
            externalPlugin={{
              pluginBaseUrl: config()?.plugins,
              pluginProperty
            }}
            // Widget
            initialCamera={initialCamera}
            widgetThemeOptions={widgetThemeOptions}
            widgetAlignSystem={widgets?.alignSystem}
            widgetAlignSystemEditing={widgetAlignEditorActivated}
            widgetLayoutConstraint={widgets?.layoutConstraint}
            floatingWidgets={widgets?.floating}
            selectedWidgetArea={selectedWidgetArea}
            onWidgetLayoutUpdate={handleWidgetUpdate}
            onWidgetAlignmentUpdate={handleWidgetAlignSystemUpdate}
            onWidgetAreaSelect={selectWidgetArea}
            // Infobox
            installableInfoboxBlocks={installableInfoboxBlocks}
            onInfoboxBlockCreate={handleInfoboxBlockCreate}
            onInfoboxBlockMove={handleInfoboxBlockMove}
            onInfoboxBlockDelete={handleInfoboxBlockRemove}
            onPropertyUpdate={handlePropertyValueUpdate}
            onPropertyItemAdd={handlePropertyItemAdd}
            onPropertyItemMove={handlePropertyItemMove}
            onPropertyItemDelete={handlePropertyItemDelete}
            // Story
            showStoryPanel={showStoryPanel}
            storyPanelRef={storyPanelRef}
            storyWrapperRef={storyWrapperRef}
            selectedStory={story}
            installableStoryBlocks={installableStoryBlocks}
            onStoryPageChange={handleStoryPageChange}
            onStoryBlockCreate={handleStoryBlockCreate}
            onStoryBlockMove={handleStoryBlockMove}
            onStoryBlockDelete={handleStoryBlockDelete}
            onPropertyValueUpdate={handlePropertyValueUpdate}
            // photoOverlay
            photoOverlayPreview={photoOverlayPreview}
            nlsLayers={nlsLayers}
            currentCameraRef={currentCameraRef}
            //sketchLayer
            sketchFeatureTooltip={sketchFeatureTooltip}
          />
        </CoreVisualizer>
      </CoreWrapper>
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled("div")<{ storyPanelPosition?: Position }>(
  ({ storyPanelPosition, theme }) => ({
    display: "flex",
    position: "relative",
    flexDirection: storyPanelPosition === "right" ? "row-reverse" : "row",
    background: theme.bg[0],
    width: "100%",
    height: "100%",
    overflow: "hidden"
  })
);

const StoryWrapper = styled("div")(() => ({
  display: "flex",
  position: "relative",
  flexShrink: 0,
  height: "100%"
}));

const CoreWrapper = styled("div")(() => ({
  position: "relative",
  flex: 1
}));
