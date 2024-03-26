import { MutableRefObject } from "react";

import { type InteractionModeType } from "@reearth/beta/lib/core/Crust";
import type { MapRef } from "@reearth/beta/lib/core/Map/ref";
import { SketchFeature, SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import type { SceneProperty } from "@reearth/beta/lib/core/Map/types";
import StoryPanel, {
  StoryPanelRef,
  type InstallableStoryBlock,
} from "@reearth/beta/lib/core/StoryPanel";
import CoreVisualizer from "@reearth/beta/lib/core/Visualizer";
import type { Camera } from "@reearth/beta/utils/value";
import type { Story } from "@reearth/services/api/storytellingApi/utils";
import { config } from "@reearth/services/config";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

export type Props = {
  visualizerRef?: MutableRefObject<MapRef | null>;
  sceneId?: string;
  isBuilt?: boolean;
  inEditor?: boolean;
  currentCamera?: Camera;
  interactionMode?: InteractionModeType;
  // storytelling
  storyPanelRef?: MutableRefObject<StoryPanelRef | null>;
  showStoryPanel?: boolean;
  selectedStory?: Story;
  installableStoryBlocks?: InstallableStoryBlock[];
  onStoryBlockMove: (id: string, targetId: number, blockId: string) => void;
  onCameraChange: (camera: Camera) => void;
  onSketchTypeChange?: (type: SketchType | undefined) => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
};

const Visualizer: React.FC<Props> = ({
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
  onStoryBlockMove,
  onCameraChange,
  onSketchTypeChange,
  onSketchFeatureCreate,
}) => {
  const {
    rootLayerId,
    sceneProperty,
    pluginProperty,
    layers,
    widgets,
    story,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    useExperimentalSandbox,
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
    selectWidgetArea,
    handlePropertyValueUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove,
    handleMount,
    zoomToLayer,
  } = useHooks({ sceneId, isBuilt, storyId: selectedStory?.id, showStoryPanel });

  return (
    <Wrapper>
      <CoreVisualizer
        ref={visualizerRef}
        engine="cesium"
        isEditable={!isBuilt}
        isBuilt={!!isBuilt}
        inEditor={!!inEditor}
        layers={layers}
        installableInfoboxBlocks={installableInfoboxBlocks}
        widgetAlignSystem={widgets?.alignSystem}
        floatingWidgets={widgets?.floating}
        widgetLayoutConstraint={widgets?.layoutConstraint}
        ownBuiltinWidgets={widgets?.ownBuiltinWidgets}
        selectedWidgetArea={selectedWidgetArea}
        zoomedLayerId={zoomedLayerId}
        rootLayerId={rootLayerId}
        sceneProperty={sceneProperty as SceneProperty}
        pluginProperty={pluginProperty}
        ready={isBuilt || (!!layers && !!widgets)}
        pluginBaseUrl={config()?.plugins}
        widgetAlignSystemEditing={widgetAlignEditorActivated}
        meta={engineMeta}
        useExperimentalSandbox={useExperimentalSandbox}
        camera={currentCamera}
        storyPanelPosition={story?.position}
        interactionMode={interactionMode}
        onCameraChange={onCameraChange}
        onLayerSelect={handleLayerSelect}
        onLayerDrop={handleLayerDrop}
        onWidgetLayoutUpdate={handleWidgetUpdate}
        onWidgetAlignmentUpdate={handleWidgetAlignSystemUpdate}
        onWidgetAreaSelect={selectWidgetArea}
        onInfoboxBlockCreate={handleInfoboxBlockCreate}
        onInfoboxBlockMove={handleInfoboxBlockMove}
        onInfoboxBlockDelete={handleInfoboxBlockRemove}
        onPropertyUpdate={handlePropertyValueUpdate}
        onPropertyItemAdd={handlePropertyItemAdd}
        onPropertyItemMove={handlePropertyItemMove}
        onPropertyItemDelete={handlePropertyItemDelete}
        onZoomToLayer={zoomToLayer}
        onSketchTypeChange={onSketchTypeChange}
        onSketchFeatureCreate={onSketchFeatureCreate}
        onMount={handleMount}>
        {showStoryPanel && (
          <StoryPanel
            ref={storyPanelRef}
            selectedStory={story}
            installableBlocks={installableStoryBlocks}
            isEditable={!!inEditor}
            onCurrentPageChange={handleStoryPageChange}
            onBlockCreate={handleStoryBlockCreate}
            onBlockDelete={handleStoryBlockDelete}
            onPropertyUpdate={handlePropertyValueUpdate}
            onPropertyItemAdd={handlePropertyItemAdd}
            onPropertyItemMove={handlePropertyItemMove}
            onPropertyItemDelete={handlePropertyItemDelete}
            onBlockMove={onStoryBlockMove}
          />
        )}
      </CoreVisualizer>
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg[0]};
  height: 100%;
`;
