import styled from "@emotion/styled";
import { FC, MutableRefObject, SetStateAction, useRef } from "react";

import { LayerSelectionReason } from "@reearth/beta/lib/core/engines";
import { ComputedFeature, ComputedLayer, Layer } from "@reearth/beta/lib/core/mantle";
import { SketchFeature, SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import CoreVisualizer, { EngineType } from "@reearth/beta/lib/core/Visualizer";
import { Camera, LatLng } from "@reearth/beta/utils/value";
import { config } from "@reearth/services/config";
import { WidgetAreaState } from "@reearth/services/state";

import Crust from "./Crust";
import { InstallableInfoboxBlock } from "./Crust/Infobox";
import { InteractionModeType, MapRef, SceneProperty } from "./Crust/types";
import { Alignment, Widget, WidgetAlignSystem, WidgetLayoutConstraint } from "./Crust/Widgets";
import type { Location } from "./Crust/Widgets";
import StoryPanel, { StoryPanelProps, StoryPanelRef } from "./StoryPanel";
import { Position, Story } from "./StoryPanel/types";
import useInfobox from "./useInfobox";

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
  sceneProperty?: SceneProperty;
  pluginProperty?:
    | {
        [key: string]: any;
      }
    | undefined;
  story?: Story;
  rootLayerId?: string;
  zoomedLayerId?: string;
  useExperimentalSandbox?: boolean;
  visualizerRef?: MutableRefObject<MapRef | null>;
  currentCamera?: Camera;
  interactionMode?: InteractionModeType;
  onCameraChange?: (camera: Camera) => void;
  handleLayerSelect?: (
    layerId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    feature: ComputedFeature | undefined,
    reason: LayerSelectionReason | undefined,
  ) => void;
  handleLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
  handleZoomToLayer?: (layerId: string | undefined) => void;
  handleSketchTypeChange?: (type: SketchType | undefined) => void;
  handleSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  handleMount?: () => void;
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
} & Omit<StoryPanelProps, "isEditable">;

const Visualizer: FC<VisualizerProps> = ({
  engine,
  engineMeta,
  isBuilt,
  inEditor,
  ready,
  layers,
  widgets,
  sceneProperty,
  pluginProperty,
  story,
  rootLayerId,
  zoomedLayerId,
  useExperimentalSandbox,
  visualizerRef,
  currentCamera,
  interactionMode,
  onCameraChange,
  handleLayerSelect,
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
  const { infobox } = useInfobox({ layers });
  const storyWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <Wrapper storyPanelPosition={story?.position}>
      <StoryWrapper ref={storyWrapperRef} />
      <CoreVisualizer
        ref={visualizerRef}
        engine={engine}
        isBuilt={!!isBuilt}
        isEditable={!isBuilt}
        layers={layers}
        ownBuiltinWidgets={widgets?.ownBuiltinWidgets}
        zoomedLayerId={zoomedLayerId}
        rootLayerId={rootLayerId}
        sceneProperty={sceneProperty as SceneProperty}
        ready={ready}
        meta={engineMeta}
        camera={currentCamera}
        interactionMode={interactionMode}
        onCameraChange={onCameraChange}
        onLayerSelect={handleLayerSelect}
        onLayerDrop={handleLayerDrop}
        onZoomToLayer={handleZoomToLayer}
        onSketchTypeChangeProp={handleSketchTypeChange}
        onSketchFeatureCreate={handleSketchFeatureCreate}
        onMount={handleMount}>
        {showStoryPanel && (
          <StoryPanel
            ref={storyPanelRef}
            storyWrapperRef={storyWrapperRef}
            selectedStory={story}
            installableStoryBlocks={installableStoryBlocks}
            isEditable={!!inEditor}
            handleStoryPageChange={handleStoryPageChange}
            handleStoryBlockCreate={handleStoryBlockCreate}
            handleStoryBlockDelete={handleStoryBlockDelete}
            handleStoryBlockMove={handleStoryBlockMove}
            handlePropertyValueUpdate={handlePropertyValueUpdate}
            handlePropertyItemAdd={handlePropertyItemAdd}
            handlePropertyItemMove={handlePropertyItemMove}
            handlePropertyItemDelete={handlePropertyItemDelete}
          />
        )}
        <Crust
          engineName={engine}
          isBuilt={!!isBuilt}
          isEditable={!isBuilt}
          inEditor={inEditor}
          camera={currentCamera}
          mapRef={visualizerRef}
          useExperimentalSandbox={useExperimentalSandbox}
          // Plugin
          externalPlugin={{ pluginBaseUrl: config()?.plugins, pluginProperty }}
          // Widget
          widgetAlignSystem={widgets?.alignSystem}
          widgetAlignSystemEditing={widgetAlignEditorActivated}
          widgetLayoutConstraint={widgets?.layoutConstraint}
          floatingWidgets={widgets?.floating}
          selectedWidgetArea={selectedWidgetArea}
          onWidgetLayoutUpdate={handleWidgetUpdate}
          onWidgetAlignmentUpdate={handleWidgetAlignSystemUpdate}
          onWidgetAreaSelect={selectWidgetArea}
          // Infobox
          infobox={infobox}
          installableInfoboxBlocks={installableInfoboxBlocks}
          onInfoboxBlockCreate={handleInfoboxBlockCreate}
          onInfoboxBlockMove={handleInfoboxBlockMove}
          onInfoboxBlockDelete={handleInfoboxBlockRemove}
          onPropertyUpdate={handlePropertyValueUpdate}
          onPropertyItemAdd={handlePropertyItemAdd}
          onPropertyItemMove={handlePropertyItemMove}
          onPropertyItemDelete={handlePropertyItemDelete}
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
