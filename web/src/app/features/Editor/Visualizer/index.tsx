import Visualizer from "@reearth/app/features/Visualizer";
import { type InteractionModeType } from "@reearth/app/features/Visualizer/Crust";
import {
  StoryPanelRef,
  type InstallableStoryBlock
} from "@reearth/app/features/Visualizer/Crust/StoryPanel";
import { DeviceType } from "@reearth/app/utils/device";
import { SketchFeature, SketchType } from "@reearth/core";
import type { MapRef } from "@reearth/core";
import type { Story } from "@reearth/services/api/storytellingApi/utils";
import { WidgetAreaState } from "@reearth/services/state";
import { MutableRefObject, SetStateAction } from "react";

import type { LayerSelectProps, SelectedLayer } from "../hooks/useLayers";

import useHooks from "./hooks";

export type Props = {
  visualizerRef?: MutableRefObject<MapRef | null>;
  sceneId?: string;
  isBuilt?: boolean;
  inEditor?: boolean;
  forceDevice?: DeviceType | undefined;
  interactionMode?: InteractionModeType;
  isVisualizerResizing?: MutableRefObject<boolean>;
  // story
  storyPanelRef?: MutableRefObject<StoryPanelRef | null>;
  showStoryPanel?: boolean;
  selectedStory?: Story;
  installableStoryBlocks?: InstallableStoryBlock[];
  widgetAlignEditorActivated: boolean | undefined;
  selectedLayer: SelectedLayer | undefined;
  selectedWidgetArea: WidgetAreaState | undefined;
  onStoryBlockMove: (id: string, targetId: number, blockId: string) => void;
  onSketchTypeChange?: (type: SketchType | undefined) => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  onSketchFeatureUpdate?: (feature: SketchFeature | null) => void;
  onVisualizerReady: (value: boolean) => void;
  onCoreLayerSelect: (props: LayerSelectProps) => void;
  onCoreAPIReady?: () => void;
  setSelectedStoryPageId: (value: string | undefined) => void;
  selectWidgetArea: (
    update?: SetStateAction<WidgetAreaState | undefined>
  ) => void;
};

const EditorVisualizer: React.FC<Props> = ({
  visualizerRef,
  sceneId,
  isBuilt,
  inEditor,
  forceDevice,
  interactionMode,
  isVisualizerResizing,
  storyPanelRef,
  showStoryPanel,
  selectedStory,
  installableStoryBlocks,
  selectedLayer,
  widgetAlignEditorActivated,
  selectedWidgetArea,
  onStoryBlockMove: handleStoryBlockMove,
  onSketchTypeChange,
  onSketchFeatureCreate,
  onSketchFeatureUpdate,
  onVisualizerReady,
  onCoreLayerSelect,
  onCoreAPIReady,
  setSelectedStoryPageId,
  selectWidgetArea
}) => {
  const {
    viewerProperty,
    pluginProperty,
    layers,
    nlsLayers,
    widgets,
    story,
    engineMeta,
    zoomedLayerId,
    installableInfoboxBlocks,
    currentCamera,
    initialCamera,
    photoOverlayPreview,
    sketchFeatureTooltip,
    handleCameraUpdate,
    handleCoreLayerSelect,
    handleLayerDrop,
    handleStoryPageChange,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleInfoboxBlockCreate,
    handleInfoboxBlockMove,
    handleInfoboxBlockRemove,
    handleWidgetUpdate,
    handleWidgetAlignSystemUpdate,
    handlePropertyValueUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove,
    handleMount,
    zoomToLayer,
    handleDeviceChange
  } = useHooks({
    sceneId,
    isBuilt,
    storyId: selectedStory?.id,
    showStoryPanel,
    selectedLayer,
    isVisualizerResizing,
    onCoreLayerSelect,
    onVisualizerReady,
    setSelectedStoryPageId,
    forceDevice
  });

  return (
    <Visualizer
      engine="cesium"
      engineMeta={engineMeta}
      isBuilt={!!isBuilt}
      inEditor={inEditor}
      ready={isBuilt || (!!layers && !!widgets)}
      layers={layers}
      nlsLayers={nlsLayers}
      widgets={widgets}
      story={story}
      viewerProperty={viewerProperty}
      pluginProperty={pluginProperty}
      // editor
      zoomedLayerId={zoomedLayerId}
      visualizerRef={visualizerRef}
      currentCamera={currentCamera}
      initialCamera={initialCamera}
      interactionMode={interactionMode}
      onCameraChange={handleCameraUpdate}
      onCoreLayerSelect={handleCoreLayerSelect}
      handleLayerDrop={handleLayerDrop}
      handleZoomToLayer={zoomToLayer}
      handleSketchTypeChange={onSketchTypeChange}
      handleSketchFeatureCreate={onSketchFeatureCreate}
      handleSketchFeatureUpdate={onSketchFeatureUpdate}
      handleMount={handleMount}
      handleCoreAPIReady={onCoreAPIReady}
      forceDevice={forceDevice}
      onDeviceChange={handleDeviceChange}
      // story
      showStoryPanel={showStoryPanel}
      storyPanelRef={storyPanelRef}
      installableStoryBlocks={installableStoryBlocks}
      handleStoryPageChange={handleStoryPageChange}
      handleStoryBlockCreate={handleStoryBlockCreate}
      handleStoryBlockDelete={handleStoryBlockDelete}
      handleStoryBlockMove={handleStoryBlockMove}
      // common for story and infobox
      handlePropertyValueUpdate={handlePropertyValueUpdate}
      handlePropertyItemAdd={handlePropertyItemAdd}
      handlePropertyItemMove={handlePropertyItemMove}
      handlePropertyItemDelete={handlePropertyItemDelete}
      // widgets
      widgetAlignEditorActivated={widgetAlignEditorActivated}
      selectedWidgetArea={selectedWidgetArea}
      handleWidgetUpdate={handleWidgetUpdate}
      handleWidgetAlignSystemUpdate={handleWidgetAlignSystemUpdate}
      selectWidgetArea={selectWidgetArea}
      // infobox
      installableInfoboxBlocks={installableInfoboxBlocks}
      handleInfoboxBlockCreate={handleInfoboxBlockCreate}
      handleInfoboxBlockMove={handleInfoboxBlockMove}
      handleInfoboxBlockRemove={handleInfoboxBlockRemove}
      // photoOverlay
      photoOverlayPreview={photoOverlayPreview}
      //sketchLayer
      sketchFeatureTooltip={sketchFeatureTooltip}
    />
  );
};

export default EditorVisualizer;
