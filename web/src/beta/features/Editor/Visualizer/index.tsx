import { useCallback } from "react";

import ContentPicker from "@reearth/beta/components/ContentPicker";
import StoryPanel, {
  type InstallableStoryBlock,
  type GQLStory,
  type GQLStoryPage,
} from "@reearth/beta/lib/core/StoryPanel";
import CoreVisualizer, { type Props as VisualizerProps } from "@reearth/beta/lib/core/Visualizer";
import { config } from "@reearth/services/config";
import { styled } from "@reearth/services/theme";

import FovSlider from "./FovSlider";
import useHooks from "./hooks";

export type Props = {
  sceneId?: string;
  isBuilt?: boolean;
  inEditor?: boolean;
  // storytelling
  showStoryPanel?: boolean;
  selectedStory?: GQLStory;
  currentPage?: GQLStoryPage;
  isAutoScrolling?: boolean;
  installableBlocks?: InstallableStoryBlock[];
  onAutoScrollingChange: (isScrolling: boolean) => void;
  onCurrentPageChange: (id: string, disableScrollIntoView?: boolean) => void;
};

const Visualizer: React.FC<Props> = ({
  sceneId,
  isBuilt,
  inEditor,
  showStoryPanel,
  selectedStory,
  currentPage,
  isAutoScrolling,
  installableBlocks,
  onAutoScrollingChange,
  onCurrentPageChange,
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
    isCapturing,
    sceneMode,
    camera,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    layerSelectionReason,
    useExperimentalSandbox,
    isVisualizerReady: _isVisualizerReady,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
    selectWidgetArea,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
    handleDropLayer,
    zoomToLayer,
    handleMount,
  } = useHooks({ sceneId, isBuilt });

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
        camera={camera}
        ready={isBuilt || (!!layers && !!widgets)}
        pluginBaseUrl={config()?.plugins}
        widgetAlignSystemEditing={widgetAlignEditorActivated}
        meta={engineMeta}
        layerSelectionReason={layerSelectionReason}
        useExperimentalSandbox={useExperimentalSandbox}
        onLayerSelect={selectLayer}
        onCameraChange={onCameraChange}
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
            sceneId={sceneId}
            selectedStory={selectedStory}
            currentPage={currentPage}
            isAutoScrolling={isAutoScrolling}
            installableBlocks={installableBlocks}
            onAutoScrollingChange={onAutoScrollingChange}
            onCurrentPageChange={onCurrentPageChange}
          />
        )}
      </CoreVisualizer>
      <FovSlider
        visible={isCapturing && sceneMode && sceneMode !== "2d"}
        onIsCapturingChange={onIsCapturingChange}
        camera={camera}
        onFovChange={onFovChange}
      />
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg[0]};
  height: 100%;
`;
