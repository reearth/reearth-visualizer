import { useCallback, useState } from "react";

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
import { navbarHeight } from "./SecondaryNav";
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
    sceneId,
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

  const [leftPanelSize, setLeftPanelSize] = useState(metrics.propertyMenuWidth);
  const [rightPanelSize, setRightPanelSize] = useState(metrics.propertyMenuWidth);

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
              minSize={metrics.propertyMenuMinWidth}
              onResizeEnd={newSize => setLeftPanelSize(newSize)}>
              {leftPanel}
            </Resizable>
          )}
          <Center>
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
          </Center>
          {rightPanel && (
            <Resizable
              direction="vertical"
              gutter="start"
              initialSize={metrics.propertyMenuWidth}
              minSize={metrics.propertyMenuMinWidth}
              onResizeEnd={newSize => setRightPanelSize(newSize)}>
              {rightPanel}
            </Resizable>
          )}
        </MainSection>
        <BottomPanelWrapper leftSize={leftPanelSize} rightSize={rightPanelSize}>
          {bottomPanel && (
            <Resizable
              direction="horizontal"
              gutter="start"
              initialSize={metrics.layerStylePanelMinWidth}
              minSize={metrics.layerStylePanelMinWidth}
              maxSize={metrics.layerStylePanelMaxWidth}>
              {bottomPanel}
            </Resizable>
          )}
        </BottomPanelWrapper>
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

const BottomPanelWrapper = styled.div<{
  leftSize: number;
  rightSize: number;
}>`
  position: relative;
  z-index: 1; // To ensure it's above other content, adjust as needed

  & > div {
    // Targeting the Resizable component
    position: absolute;
    bottom: 0;
    left: ${({ leftSize }) => `${leftSize}px`};
    right: ${({ rightSize }) => `${rightSize}px`};
  }
`;

const Center = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const VisualizerWrapper = styled.div<{
  tab?: Tab;
  hasNav?: boolean;
  visualizerWidth?: string | number;
}>`
  border-radius: 4px;
  height: ${({ hasNav }) => (hasNav ? `calc(100% - ${navbarHeight})` : "100%")};
  width: ${({ visualizerWidth }) =>
    typeof visualizerWidth === "number" ? `${visualizerWidth}px` : visualizerWidth};
`;
