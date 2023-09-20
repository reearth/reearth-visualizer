import { MutableRefObject, useCallback } from "react";

import ContentPicker from "@reearth/beta/components/ContentPicker";
import type { MapRef } from "@reearth/beta/lib/core/Map/ref";
import StoryPanel, { type InstallableStoryBlock } from "@reearth/beta/lib/core/StoryPanel";
import CoreVisualizer, { type Props as VisualizerProps } from "@reearth/beta/lib/core/Visualizer";
import type { Camera } from "@reearth/beta/utils/value";
import type { Page, Story } from "@reearth/services/api/storytellingApi/utils";
import { config } from "@reearth/services/config";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

export type Props = {
  visualizerRef?: MutableRefObject<MapRef | null>;
  sceneId?: string;
  isBuilt?: boolean;
  inEditor?: boolean;
  currentCamera?: Camera;
  // storytelling
  showStoryPanel?: boolean;
  selectedStory?: Story;
  currentPage?: Page;
  isAutoScrolling?: boolean;
  installableBlocks?: InstallableStoryBlock[];
  onAutoScrollingChange: (isScrolling: boolean) => void;
  onCurrentPageChange: (id: string, disableScrollIntoView?: boolean) => void;
  onCameraChange: (camera: Camera) => void;
};

const Visualizer: React.FC<Props> = ({
  visualizerRef,
  sceneId,
  isBuilt,
  inEditor,
  currentCamera,
  showStoryPanel,
  selectedStory,
  currentPage,
  isAutoScrolling,
  installableBlocks,
  onAutoScrollingChange,
  onCurrentPageChange,
  onCameraChange,
}) => {
  const {
    rootLayerId,
    selectedBlockId,
    zoomedLayerId,
    sceneProperty,
    pluginProperty,
    clusters,
    layers,
    widgets,
    tags,
    selectedLayerId,
    blocks,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    layerSelectionReason,
    useExperimentalSandbox,
    isVisualizerReady: _isVisualizerReady,
    installedStoryBlocks,
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
    zoomToLayer,
    handleMount,
    handleUpdatePropertyValue,
  } = useHooks({ sceneId, isBuilt, storyId: selectedStory?.id, pageId: currentPage?.id });

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
        selectedLayerId={selectedLayerId}
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
        layerSelectionReason={layerSelectionReason}
        useExperimentalSandbox={useExperimentalSandbox}
        camera={currentCamera}
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
            selectedStory={selectedStory}
            currentPage={currentPage}
            isAutoScrolling={isAutoScrolling}
            installableBlocks={installableBlocks}
            installedBlocks={installedStoryBlocks}
            isEditable={!!inEditor}
            onBlockCreate={handleStoryBlockCreate}
            onBlockDelete={handleStoryBlockDelete}
            onPropertyUpdate={handlePropertyValueUpdate}
            onAutoScrollingChange={onAutoScrollingChange}
            onCurrentPageChange={onCurrentPageChange}
            handleUpdatePropertyValue={handleUpdatePropertyValue}
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
