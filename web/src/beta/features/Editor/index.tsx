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
import SketchLayerManager from "./SketchLayerManager";
import useLayers from "./useLayers";
import useLayerStyles from "./useLayerStyles";
import useScene from "./useScene";
import useSketch from "./useSketch";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
};

const Editor: React.FC<Props> = ({ sceneId, projectId, workspaceId, tab }) => {
  const {
    visualizerRef,
    isVisualizerReady,
    selectedDevice,
    selectedProjectType,
    visualizerWidth,
    showWidgetEditor,
    showDataSourceManager,
    currentCamera,
    showSketchLayerManager,
    handleDataSourceManagerCloser,
    handleDataSourceManagerOpener,
    handleSketchLayerManagerCloser,
    handleSketchLayerManagerOpener,
    handleDeviceChange,
    handleProjectTypeChange,
    handleWidgetEditorToggle,
    handleFlyTo,
    handleCameraUpdate,
    handlePropertyValueUpdate,
  } = useHooks({ sceneId, tab });

  const {
    selectedStory,
    storyPanelRef,
    currentPage,
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
  });

  const {
    nlsLayers,
    selectedLayer,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerNameUpdate,
    handleLayerConfigUpdate,
    handleLayerVisibilityUpdate,
  } = useLayers({
    sceneId,
    isVisualizerReady,
    visualizerRef,
  });

  const { scene, selectedSceneSetting, sceneSettings, handleSceneSettingSelect } = useScene({
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
      handleLayerSelect(undefined);
      handleSceneSettingSelect(undefined);
      handleLayerStyleSelect(layerStyleId);
    },
    [handleLayerStyleSelect, handleSceneSettingSelect, handleLayerSelect],
  );

  const handleLayerSelected = useCallback(
    (layerId: string) => {
      setSelectedLayerStyleId(undefined);
      handleSceneSettingSelect(undefined);
      handleLayerSelect(layerId);
    },
    [handleLayerSelect, handleSceneSettingSelect, setSelectedLayerStyleId],
  );

  const handleSceneSettingSelected = useCallback(
    (collection?: string) => {
      setSelectedLayerStyleId(undefined);
      handleLayerSelect(undefined);
      handleSceneSettingSelect(collection);
    },
    [handleLayerSelect, handleSceneSettingSelect, setSelectedLayerStyleId],
  );

  const { leftPanel } = useLeftPanel({
    tab,
    scene,
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
    onSceneSettingSelect: handleSceneSettingSelected,
    onDataSourceManagerOpen: handleDataSourceManagerOpener,
    onSketchLayerManagerOpen: handleSketchLayerManagerOpener,
    onFlyTo: handleFlyTo,
    onPropertyUpdate: handlePropertyValueUpdate,
  });

  const { rightPanel } = useRightPanel({
    scene,
    layerStyles,
    tab,
    sceneId,
    nlsLayers,
    currentPage,
    currentCamera,
    selectedLayerStyleId: selectedLayerStyle?.id,
    selectedSceneSetting: selectedSceneSetting,
    sceneSettings: sceneSettings,
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

  const { sketchType, handleSketchTypeChange, handleSketchFeatureCreate } = useSketch({
    tab,
    nlsLayers,
    selectedLayer,
    visualizerRef,
    handleLayerConfigUpdate,
  });

  const { secondaryNavbar } = useSecondaryNavbar({
    tab,
    sceneId,
    id: selectedProjectType === "story" ? selectedStory?.id : projectId,
    selectedDevice,
    selectedProjectType,
    showWidgetEditor,
    sketchType,
    isSketchLayerSelected: !!selectedLayer?.config?.data?.isSketchLayer,
    handleSketchTypeChange,
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
              minSize={metrics.propertyMenuMinWidth}
              localStorageKey={`${tab}LeftPanel`}>
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
                  inEditor={tab !== "publish"}
                  visualizerRef={visualizerRef}
                  storyPanelRef={storyPanelRef}
                  sceneId={sceneId}
                  showStoryPanel={selectedProjectType === "story"}
                  selectedStory={selectedStory}
                  installableStoryBlocks={installableStoryBlocks}
                  currentCamera={currentCamera}
                  onStoryBlockMove={onStoryBlockMove}
                  onCameraChange={handleCameraUpdate}
                  onSketchTypeChange={handleSketchTypeChange}
                  onSketchFeatureCreate={handleSketchFeatureCreate}
                />
              </VisualizerWrapper>
              {bottomPanel && (
                <Resizable
                  direction="horizontal"
                  gutter="start"
                  initialSize={metrics.bottomPanelMinHeight}
                  minSize={metrics.bottomPanelMinHeight}
                  maxSize={metrics.bottomPanelMaxHeight}
                  localStorageKey="bottomPanel">
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
              minSize={metrics.propertyMenuMinWidth}
              localStorageKey={`${tab}RightPanel`}>
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
        {showSketchLayerManager && (
          <SketchLayerManager
            onSubmit={handleLayerAdd}
            sceneId={sceneId}
            onClose={handleSketchLayerManagerCloser}
            layerStyles={layerStyles}
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
  padding: 2px;
  width: ${({ visualizerWidth }) =>
    typeof visualizerWidth === "number"
      ? `calc(${visualizerWidth} - 4px)`
      : `calc(${visualizerWidth} - 4px)`};
`;
