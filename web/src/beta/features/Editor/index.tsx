import { useCallback } from "react";

import Resizable from "@reearth/beta/components/Resizable";
import useBottomPanel from "@reearth/beta/features/Editor/useBottomPanel";
import useLeftPanel from "@reearth/beta/features/Editor/useLeftPanel";
import useRightPanel from "@reearth/beta/features/Editor/useRightPanel";
import useSecondaryNavbar from "@reearth/beta/features/Editor/useSecondaryNavbar";
import useStorytelling from "@reearth/beta/features/Editor/useStorytelling";
import Visualizer from "@reearth/beta/features/Editor/Visualizer";
import Navbar, { type Tab } from "@reearth/beta/features/Navbar";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { metrics, styled } from "@reearth/services/theme";

import DataSourceManager from "./DataSourceManager";
import useHooks from "./hooks";
import useLayers from "./useLayers";
import useLayerStyles from "./useLayerStyles";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
};

const Editor: React.FC<Props> = ({ sceneId, projectId, workspaceId, tab }) => {
  const {
    visualizerRef,
    selectedSceneSetting,
    selectedDevice,
    selectedProjectType,
    visualizerWidth,
    showWidgetEditor,
    showDataSourceManager,
    currentCamera,
    handleDataSourceManagerCloser,
    handleDataSourceManagerOpener,
    handleSceneSettingSelect,
    handleDeviceChange,
    handleProjectTypeChange,
    handleWidgetEditorToggle,
    handleFlyTo,
    handleCameraUpdate,
  } = useHooks({ sceneId, tab });

  const {
    selectedStory,
    currentPage,
    isAutoScrolling,
    installableStoryBlocks,
    handleCurrentPageChange,
    handlePageDuplicate,
    handlePageDelete,
    handlePageAdd,
    handlePageMove,
    handleStoryBlockMove: onStoryBlockMove,
    handlePageUpdate,
  } = useStorytelling({
    sceneId,
    onFlyTo: handleFlyTo,
  });

  const {
    nlsLayers,
    selectedLayer,
    setSelectedLayerId,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerNameUpdate,
    handleLayerConfigUpdate,
    handleLayerVisibilityUpdate,
  } = useLayers({
    sceneId,
  });

  const {
    layerStyles,
    selectedLayerStyle,
    setSelectedLayerStyleId,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleValueUpdate,
    handleLayerStyleSelect,
  } = useLayerStyles({ sceneId });

  // State handling for editor UI
  const handleLayerStyleSelected = useCallback(
    (layerStyleId: string) => {
      setSelectedLayerId(undefined);
      handleLayerStyleSelect(layerStyleId);
    },
    [handleLayerStyleSelect, setSelectedLayerId],
  );

  const handleLayerSelected = useCallback(
    (layerId: string) => {
      setSelectedLayerStyleId(undefined);
      handleLayerSelect(layerId);
    },
    [handleLayerSelect, setSelectedLayerStyleId],
  );

  const { leftPanel } = useLeftPanel({
    tab,
    nlsLayers,
    selectedStory,
    selectedLayerId: selectedLayer?.id,
    currentPageId: currentPage?.id,
    selectedSceneSetting,
    onCurrentPageChange: handleCurrentPageChange,
    onPageDuplicate: handlePageDuplicate,
    onPageDelete: handlePageDelete,
    onPageAdd: handlePageAdd,
    onPageMove: handlePageMove,
    onLayerDelete: handleLayerDelete,
    onLayerSelect: handleLayerSelected,
    onLayerNameUpdate: handleLayerNameUpdate,
    onLayerVisibilityUpate: handleLayerVisibilityUpdate,
    onSceneSettingSelect: handleSceneSettingSelect,
    onDataSourceManagerOpen: handleDataSourceManagerOpener,
    onFlyTo: handleFlyTo,
  });

  const { rightPanel } = useRightPanel({
    layerStyles,
    tab,
    sceneId,
    nlsLayers,
    currentPage,
    currentCamera,
    showSceneSettings: selectedSceneSetting,
    selectedLayerStyleId: selectedLayerStyle?.id,
    selectedLayerId: selectedLayer?.id,
    onFlyTo: handleFlyTo,
    onPageUpdate: handlePageUpdate,
    onLayerStyleValueUpdate: handleLayerStyleValueUpdate,
    onLayerConfigUpdate: handleLayerConfigUpdate,
  });

  const { bottomPanel } = useBottomPanel({
    tab,
    layerStyles,
    selectedLayerStyleId: selectedLayerStyle?.id,
    onLayerStyleAdd: handleLayerStyleAdd,
    onLayerStyleDelete: handleLayerStyleDelete,
    onLayerStyleNameUpdate: handleLayerStyleNameUpdate,
    onLayerStyleSelect: handleLayerStyleSelected,
  });

  const { secondaryNavbar } = useSecondaryNavbar({
    tab,
    projectId,
    selectedDevice,
    selectedProjectType,
    showWidgetEditor,
    handleProjectTypeChange,
    handleDeviceChange,
    handleWidgetEditorToggle,
  });

  return (
    <DndProvider>
      <Wrapper>
        <Navbar
          sceneId={sceneId}
          projectId={projectId}
          workspaceId={workspaceId}
          currentTab={tab}
        />
        <MainSection>
          {leftPanel && (
            <Resizable
              direction="vertical"
              gutter="end"
              initialSize={metrics.propertyMenuWidth}
              minSize={metrics.propertyMenuMinWidth}>
              {leftPanel}
            </Resizable>
          )}
          <Center>
            <CenterContent>
              {secondaryNavbar}
              <VisualizerWrapper
                tab={tab}
                hasNav={!!secondaryNavbar}
                visualizerWidth={visualizerWidth}>
                <Visualizer
                  inEditor
                  visualizerRef={visualizerRef}
                  sceneId={sceneId}
                  showStoryPanel={selectedProjectType === "story"}
                  selectedStory={selectedStory}
                  currentPage={currentPage}
                  isAutoScrolling={isAutoScrolling}
                  installableBlocks={installableStoryBlocks}
                  currentCamera={currentCamera}
                  onCurrentPageChange={handleCurrentPageChange}
                  onStoryBlockMove={onStoryBlockMove}
                  onCameraChange={handleCameraUpdate}
                />
              </VisualizerWrapper>
              {bottomPanel && (
                <Resizable
                  direction="horizontal"
                  gutter="start"
                  initialSize={metrics.bottomPanelMinHeight}
                  minSize={metrics.bottomPanelMinHeight}
                  maxSize={metrics.bottomPanelMaxHeight}>
                  {bottomPanel}
                </Resizable>
              )}
            </CenterContent>
          </Center>
          {rightPanel && (
            <Resizable
              direction="vertical"
              gutter="start"
              initialSize={metrics.propertyMenuWidth}
              minSize={metrics.propertyMenuMinWidth}>
              {rightPanel}
            </Resizable>
          )}
        </MainSection>

        {showDataSourceManager && (
          <DataSourceManager
            sceneId={sceneId}
            onClose={handleDataSourceManagerCloser}
            onSubmit={handleLayerAdd}
          />
        )}
      </Wrapper>
    </DndProvider>
  );
};

export default Editor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.content.main};
`;

const MainSection = styled.div`
  display: flex;
  flex-grow: 1;
  height: 0;
  background: ${({ theme }) => theme.bg[0]};
`;

const Center = styled.div`
  height: 100%;
  flex-grow: 1;
`;

const CenterContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const VisualizerWrapper = styled.div<{
  tab?: Tab;
  hasNav?: boolean;
  visualizerWidth?: string | number;
}>`
  flex: 1;
  min-height: 0;
  border-radius: 4px;
  width: ${({ visualizerWidth }) =>
    typeof visualizerWidth === "number" ? `${visualizerWidth}px` : visualizerWidth};
`;
