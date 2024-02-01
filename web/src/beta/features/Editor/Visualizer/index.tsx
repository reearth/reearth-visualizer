import { MutableRefObject, useCallback } from "react";

import ContentPicker from "@reearth/beta/components/ContentPicker";
import { InteractionModeType } from "@reearth/beta/lib/core/Crust";
import type { MapRef } from "@reearth/beta/lib/core/Map/ref";
import { SketchFeature, SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import type { SceneProperty } from "@reearth/beta/lib/core/Map/types";
import StoryPanel, {
  StoryPanelRef,
  type InstallableStoryBlock,
} from "@reearth/beta/lib/core/StoryPanel";
import { type Props as VisualizerProps } from "@reearth/beta/lib/core/Visualizer";
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
  installableBlocks?: InstallableStoryBlock[];
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
  installableBlocks,
  onStoryBlockMove,
  onCameraChange,
  onSketchTypeChange,
  onSketchFeatureCreate,
}) => {
  const {
    rootLayerId,
    selectedBlockId,
    sceneProperty,
    pluginProperty,
    layers,
    widgets,
    story,
    blocks,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    useExperimentalSandbox,
    isVisualizerReady: _isVisualizerReady,
    zoomedLayerId,
    handleCurrentPageChange,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handlePropertyValueUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
    selectWidgetArea,
    handleDropLayer,
    handleMount,
    zoomToLayer,
  } = useHooks({ sceneId, isBuilt, storyId: selectedStory?.id, showStoryPanel });

  const renderInfoboxInsertionPopUp = useCallback<
    NonNullable<VisualizerProps["renderInfoboxInsertionPopup"]>
  >(
    (onSelect, onClose) => (
      <ContentPicker items={blocks} onSelect={onSelect} onClickAway={onClose} />
    ),
    [blocks],
  );

  return (
    <Wrapper>
      <CoreVisualizer
        ref={visualizerRef}
        engine="cesium"
        isEditable={!isBuilt}
        isBuilt={!!isBuilt}
        inEditor={!!inEditor}
        layers={layers}
        widgetAlignSystem={widgets?.alignSystem}
        floatingWidgets={widgets?.floating}
        widgetLayoutConstraint={widgets?.layoutConstraint}
        ownBuiltinWidgets={widgets?.ownBuiltinWidgets}
        selectedBlockId={selectedBlockId}
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
        onLayerSelect={selectLayer}
        onWidgetLayoutUpdate={onWidgetUpdate}
        onWidgetAlignmentUpdate={onWidgetAlignSystemUpdate}
        onWidgetAreaSelect={selectWidgetArea}
        onBlockSelect={selectBlock}
        onBlockChange={onBlockChange}
        onBlockMove={onBlockMove}
        onBlockDelete={onBlockRemove}
        onBlockInsert={onBlockInsert}
        onLayerDrop={handleDropLayer}
        onZoomToLayer={zoomToLayer}
        onMount={handleMount}
        onSketchTypeChange={onSketchTypeChange}
        onSketchFeatureCreate={onSketchFeatureCreate}
        renderInfoboxInsertionPopup={renderInfoboxInsertionPopUp}>
        {showStoryPanel && (
          <StoryPanel
            ref={storyPanelRef}
            selectedStory={story}
            installableBlocks={installableBlocks}
            isEditable={!!inEditor}
            onCurrentPageChange={handleCurrentPageChange}
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
