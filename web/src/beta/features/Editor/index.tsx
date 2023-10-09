import Resizable from "@reearth/beta/components/Resizable";
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
    zoomedLayerId,
    zoomToLayer,
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
    handleAutoScrollingChange,
    handleCurrentPageChange,
    handlePageDuplicate,
    handlePageDelete,
    handlePageAdd,
    handlePageMove,
    handleStoryBlockMove: onStoryBlockMove,
  } = useStorytelling({
    sceneId,
    onFlyTo: handleFlyTo,
  });

  const {
    nlsLayers,
    selectedLayer,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerNameUpdate,
  } = useLayers({
    sceneId,
  });

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
    onLayerSelect: handleLayerSelect,
    onLayerNameUpdate: handleLayerNameUpdate,
    onSceneSettingSelect: handleSceneSettingSelect,
    onDataSourceManagerOpen: handleDataSourceManagerOpener,
    onZoomToLayer: zoomToLayer,
  });

  const { rightPanel } = useRightPanel({
    tab,
    sceneId,
    nlsLayers,
    currentPage,
    currentCamera,
    showSceneSettings: selectedSceneSetting,
    onFlyTo: handleFlyTo,
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
                currentPageId={currentPage?.id}
                isAutoScrolling={isAutoScrolling}
                installableBlocks={installableStoryBlocks}
                currentCamera={currentCamera}
                onAutoScrollingChange={handleAutoScrollingChange}
                onCurrentPageChange={handleCurrentPageChange}
                onStoryBlockMove={onStoryBlockMove}
                onCameraChange={handleCameraUpdate}
                onZoomToLayer={zoomToLayer}
                zoomedLayerId={zoomedLayerId}
              />
            </VisualizerWrapper>
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
