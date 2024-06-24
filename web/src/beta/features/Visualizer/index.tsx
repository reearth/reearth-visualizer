import styled from "@emotion/styled";
import { FC, MutableRefObject, SetStateAction } from "react";

import { Camera, LatLng, ValueType, ValueTypes } from "@reearth/beta/utils/value";
import {
  type SketchFeature,
  type SketchType,
  type ComputedFeature,
  type ComputedLayer,
  type Layer,
  type EngineType,
  type ViewerProperty,
  CoreVisualizer,
} from "@reearth/core";
import { config } from "@reearth/services/config";
import { WidgetAreaState } from "@reearth/services/state";

import Crust from "./Crust";
import { InstallableInfoboxBlock } from "./Crust/Infobox";
import { InstallableStoryBlock, StoryPanelRef } from "./Crust/StoryPanel";
import { Position, Story } from "./Crust/StoryPanel/types";
import { WidgetThemeOptions } from "./Crust/theme";
import { InteractionModeType, MapRef } from "./Crust/types";
import { Alignment, Widget, WidgetAlignSystem, WidgetLayoutConstraint } from "./Crust/Widgets";
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
  widgets?: {
    floating: (Omit<Widget, "layout" | "extended"> & {
      extended?: boolean;
    })[];
    alignSystem?: WidgetAlignSystem;
    ownBuiltinWidgets: string[];
    layoutConstraint?:
      | {
          [x: string]: WidgetLayoutConstraint;
        }
      | undefined;
  };
  viewerProperty?: ViewerProperty;
  pluginProperty?:
    | {
        [key: string]: any;
      }
    | undefined;
  story?: Story;
  zoomedLayerId?: string;
  visualizerRef?: MutableRefObject<MapRef | null>;
  currentCamera?: Camera;
  interactionMode?: InteractionModeType;
  onCameraChange?: (camera: Camera) => void;
  onCoreLayerSelect?: (
    layerId: string | undefined,
    layer: ComputedLayer | undefined,
    feature: ComputedFeature | undefined,
  ) => void;
  handleLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
  handleZoomToLayer?: (layerId: string | undefined) => void;
  handleSketchTypeChange?: (type: SketchType | undefined) => void;
  handleSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  handleMount?: () => void;
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
    },
  ) => Promise<void>;
  handleWidgetAlignSystemUpdate?: (location: Location, align: Alignment) => Promise<void>;
  selectWidgetArea?: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
  // infobox
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  handleInfoboxBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined,
  ) => Promise<void>;
  handleInfoboxBlockMove?: (id: string, targetIndex: number) => Promise<void>;
  handleInfoboxBlockRemove?: (id?: string | undefined) => Promise<void>;
} & {
  showStoryPanel?: boolean;
  storyPanelRef?: MutableRefObject<StoryPanelRef | null>;
  installableStoryBlocks?: InstallableStoryBlock[];
  handleStoryPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  handleStoryBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  handleStoryBlockMove?: (id: string, targetId: number, blockId: string) => void;
  handleStoryBlockDelete?: (
    pageId?: string | undefined,
    blockId?: string | undefined,
  ) => Promise<void>;
  handlePropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  handlePropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  handlePropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  handlePropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

const Visualizer: FC<VisualizerProps> = ({
  engine,
  engineMeta,
  isBuilt,
  inEditor,
  ready,
  layers,
  widgets,
  viewerProperty,
  pluginProperty,
  story,
  zoomedLayerId,
  visualizerRef,
  currentCamera,
  interactionMode,
  onCameraChange,
  onCoreLayerSelect,
  handleLayerDrop,
  handleZoomToLayer,
  handleSketchTypeChange,
  handleSketchFeatureCreate,
  handleMount,
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
}) => {
  const {
    shouldRender,
    overriddenViewerProperty,
    overrideViewerProperty,
    storyWrapperRef,
    visualizerCamera,
    handleCoreLayerSelect,
  } = useHooks({
    ownBuiltinWidgets: widgets?.ownBuiltinWidgets,
    viewerProperty,
    onCoreLayerSelect,
    currentCamera,
  });

  return (
    <Wrapper storyPanelPosition={story?.position}>
      <StoryWrapper ref={storyWrapperRef} />
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
        onCameraChange={onCameraChange}
        onLayerSelect={handleCoreLayerSelect}
        onLayerDrop={handleLayerDrop}
        onZoomToLayer={handleZoomToLayer}
        onSketchTypeChangeProp={handleSketchTypeChange}
        onSketchFeatureCreate={handleSketchFeatureCreate}
        onMount={handleMount}>
        <Crust
          engineName={engine}
          isBuilt={!!isBuilt}
          isEditable={!isBuilt}
          inEditor={inEditor}
          mapRef={visualizerRef}
          layers={layers}
          // Viewer
          viewerProperty={overriddenViewerProperty}
          overrideViewerProperty={overrideViewerProperty}
          // Plugin
          externalPlugin={{ pluginBaseUrl: config()?.plugins, pluginProperty }}
          // Widget
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
        />
      </CoreVisualizer>
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled("div")<{ storyPanelPosition?: Position }>`
  display: flex;
  position: relative;
  flex-direction: ${({ storyPanelPosition }) =>
    storyPanelPosition === "right" ? "row-reverse" : "row"};
  position: relative;
  background: ${({ theme }) => theme.bg[0]};
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const StoryWrapper = styled("div")`
  position: relative;
  display: flex;
  height: 100%;
  flex-shrink: 0;
`;
