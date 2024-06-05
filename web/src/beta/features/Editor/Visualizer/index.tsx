import { MutableRefObject, SetStateAction, useCallback } from "react";

import Visualizer from "@reearth/beta/features/Visualizer";
import { type InteractionModeType } from "@reearth/beta/features/Visualizer/Crust";
import {
  StoryPanelRef,
  type InstallableStoryBlock,
} from "@reearth/beta/features/Visualizer/StoryPanel";
import type { Camera } from "@reearth/beta/utils/value";
import { SketchFeature, SketchType } from "@reearth/core";
import type { MapRef } from "@reearth/core";
import type { Story } from "@reearth/services/api/storytellingApi/utils";
import { WidgetAreaState } from "@reearth/services/state";

import type { SelectedLayer } from "../useLayers";

import useHooks from "./hooks";

export type Props = {
  visualizerRef?: MutableRefObject<MapRef | null>;
  sceneId?: string;
  isBuilt?: boolean;
  inEditor?: boolean;
  currentCamera?: Camera;
  interactionMode?: InteractionModeType;
  // story
  storyPanelRef?: MutableRefObject<StoryPanelRef | null>;
  showStoryPanel?: boolean;
  selectedStory?: Story;
  installableStoryBlocks?: InstallableStoryBlock[];
  widgetAlignEditorActivated: boolean | undefined;
  selectedLayer: SelectedLayer | undefined;
  selectedWidgetArea: WidgetAreaState | undefined;
  onStoryBlockMove: (id: string, targetId: number, blockId: string) => void;
  onCameraChange: (camera: Camera) => void;
  onSketchTypeChange?: (type: SketchType | undefined) => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  setIsVisualizerReady: (value: boolean) => void;
  setSelectedLayer: (value: SelectedLayer | undefined) => void;
  setSelectedLayerStyle: (value: string | undefined) => void;
  setSelectedSceneSetting: (value: string | undefined) => void;
  setSelectedStoryPageId: (value: string | undefined) => void;
  selectWidgetArea: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
};

const EditorVisualizer: React.FC<Props> = ({
  visualizerRef,
  sceneId,
  isBuilt,
  inEditor,
  currentCamera,
  interactionMode,
  storyPanelRef,
  showStoryPanel,
  selectedStory,
  installableStoryBlocks,
  selectedLayer,
  widgetAlignEditorActivated,
  selectedWidgetArea,
  onStoryBlockMove: handleStoryBlockMove,
  onCameraChange,
  onSketchTypeChange,
  onSketchFeatureCreate,
  setIsVisualizerReady,
  setSelectedLayer,
  setSelectedLayerStyle,
  setSelectedSceneSetting,
  setSelectedStoryPageId,
  selectWidgetArea,
}) => {
  const {
    viewerProperty,
    pluginProperty,
    layers,
    widgets,
    story,
    engineMeta,
    zoomedLayerId,
    installableInfoboxBlocks,
    handleLayerSelect,
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
    zoomToLayer,
  } = useHooks({
    sceneId,
    isBuilt,
    storyId: selectedStory?.id,
    showStoryPanel,
    selectedLayer,
    setSelectedLayer,
    setSelectedLayerStyle,
    setSelectedSceneSetting,
    setSelectedStoryPageId,
  });

  const handleMount = useCallback(() => setIsVisualizerReady(true), [setIsVisualizerReady]);

  return (
    <Visualizer
      engine="cesium"
      engineMeta={engineMeta}
      isBuilt={!!isBuilt}
      inEditor={inEditor}
      ready={isBuilt || (!!layers && !!widgets)}
      layers={layers}
      widgets={widgets}
      story={story}
      viewerProperty={viewerProperty}
      pluginProperty={pluginProperty}
      // editor
      zoomedLayerId={zoomedLayerId}
      visualizerRef={visualizerRef}
      currentCamera={currentCamera}
      interactionMode={interactionMode}
      onCameraChange={onCameraChange}
      handleLayerSelect={handleLayerSelect}
      handleLayerDrop={handleLayerDrop}
      handleZoomToLayer={zoomToLayer}
      handleSketchTypeChange={onSketchTypeChange}
      handleSketchFeatureCreate={onSketchFeatureCreate}
      handleMount={handleMount}
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
    />
  );
};

export default EditorVisualizer;
