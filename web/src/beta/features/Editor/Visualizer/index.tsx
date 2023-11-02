import { MutableRefObject, useCallback } from "react";

import ContentPicker from "@reearth/beta/components/ContentPicker";
import type { MapRef } from "@reearth/beta/lib/core/Map/ref";
import StoryPanel, { type InstallableStoryBlock } from "@reearth/beta/lib/core/StoryPanel";
import CoreVisualizer, { type Props as VisualizerProps } from "@reearth/beta/lib/core/Visualizer";
import type { Camera } from "@reearth/beta/utils/value";
import type { Story, Page } from "@reearth/services/api/storytellingApi/utils";
import { config } from "@reearth/services/config";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

export type Props = {
  visualizerRef?: MutableRefObject<MapRef | null>;
  storyPanelRef?: MutableRefObject<any>;
  sceneId?: string;
  isBuilt?: boolean;
  inEditor?: boolean;
  currentCamera?: Camera;
  // storytelling
  showStoryPanel?: boolean;
  selectedStory?: Story;
  currentPage?: Page;
  installableBlocks?: InstallableStoryBlock[];
  onStoryBlockMove: (id: string, targetId: number, blockId: string) => void;
  onCameraChange: (camera: Camera) => void;
};

const Visualizer: React.FC<Props> = ({
  visualizerRef,
  storyPanelRef,
  sceneId,
  isBuilt,
  inEditor,
  currentCamera,
  showStoryPanel,
  selectedStory,
  currentPage,
  installableBlocks,
  onStoryBlockMove,
  onCameraChange,
}) => {
  const {
    rootLayerId,
    selectedBlockId,
    sceneProperty,
    pluginProperty,
    clusters,
    layers,
    widgets,
    story,
    tags,
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
  } = useHooks({ sceneId, isBuilt, storyId: selectedStory?.id, currentPage, showStoryPanel });

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
        sceneProperty={sceneProperty}
        tags={tags}
        pluginProperty={pluginProperty}
        clusters={clusters}
        ready={isBuilt || (!!layers && !!widgets)}
        pluginBaseUrl={config()?.plugins}
        widgetAlignSystemEditing={widgetAlignEditorActivated}
        meta={engineMeta}
        useExperimentalSandbox={useExperimentalSandbox}
        camera={currentCamera}
        storyPanelPosition={story?.position}
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
            onStoryBlockMove={onStoryBlockMove}
          />
        )}
      </CoreVisualizer>
      {/* <FovSlider
        visible={isCapturing && sceneMode && sceneMode !== "2d"}
        onIsCapturingChange={onIsCapturingChange}
        camera={camera}
        onFovChange={onFovChange}
      /> */}
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg[0]};
  height: 100%;
`;
