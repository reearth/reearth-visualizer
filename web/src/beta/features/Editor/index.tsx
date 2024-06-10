import Resizable from "@reearth/beta/components/Resizable";
import useBottomPanel from "@reearth/beta/features/Editor/useBottomPanel";
import useLeftPanel from "@reearth/beta/features/Editor/useLeftPanel";
import useRightPanel from "@reearth/beta/features/Editor/useRightPanel";
import useSecondaryNavbar from "@reearth/beta/features/Editor/useSecondaryNavbar";
import useStorytelling from "@reearth/beta/features/Editor/useStorytelling";
import EditorVisualizer from "@reearth/beta/features/Editor/Visualizer";
import Navbar, { type Tab } from "@reearth/beta/features/Navbar";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { styled } from "@reearth/services/theme";

import DataSourceManager from "./DataSourceManager";
import useHooks from "./hooks";
import SketchLayerManager from "./SketchLayerManager";
import useLayers from "./useLayers";
import useLayerStyles from "./useLayerStyles";
import useScene from "./useScene";
import useSketch from "./useSketch";
import { useUISelection } from "./useUISelection";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
};

const spacing = {
  propertyMenuWidth: 308,
  propertyMenuMinWidth: 200,
  bottomPanelMinHeight: 136,
  bottomPanelMaxHeight: 232,
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
    selectedWidget,
    selectedWidgetArea,
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
    handleIsVisualizerUpdate,
    setSelectedWidget,
    selectWidgetArea,
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
    setSelectedStoryPageId,
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
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleValueUpdate,
    handleLayerStyleSelect,
  } = useLayerStyles({ sceneId });

  // TODO: manage panel item selection
  const { handleLayerSelected, handleLayerStyleSelected, handleSceneSettingSelected } =
    useUISelection({
      handleLayerSelect,
      handleLayerStyleSelect,
      handleSceneSettingSelect,
    });

  const { leftPanel } = useLeftPanel({
    tab,
    scene,
    nlsLayers,
    selectedStory,
    selectedLayerId: selectedLayer?.layer?.id,
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

  const {
    sketchType,
    handleSketchTypeChange,
    handleSketchFeatureCreate,
    handleGeoJsonFeatureUpdate,
  } = useSketch({
    tab,
    nlsLayers,
    selectedLayer: selectedLayer?.layer,
    visualizerRef,
    handleLayerConfigUpdate,
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
    selectedLayer: selectedLayer,
    selectedWidget: selectedWidget,
    selectedWidgetArea: selectedWidgetArea,
    onFlyTo: handleFlyTo,
    onPageUpdate: handlePageUpdate,
    onLayerStyleValueUpdate: handleLayerStyleValueUpdate,
    onLayerConfigUpdate: handleLayerConfigUpdate,
    onGeoJsonFeatureUpdate: handleGeoJsonFeatureUpdate,
    setSelectedWidget: setSelectedWidget,
    setSelectedWidgetArea: selectWidgetArea,
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
    sceneId,
    id: selectedProjectType === "story" ? selectedStory?.id : projectId,
    selectedDevice,
    selectedProjectType,
    showWidgetEditor,
    sketchType,
    isSketchLayerSelected: !!selectedLayer?.layer?.isSketch,
    handleSketchTypeChange,
    handleProjectTypeChange,
    handleDeviceChange,
    handleWidgetEditorToggle,
    selectWidgetArea: selectWidgetArea,
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
              initialSize={spacing.propertyMenuWidth}
              minSize={spacing.propertyMenuMinWidth}
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
                <EditorVisualizer
                  inEditor={tab !== "publish"}
                  selectedLayer={selectedLayer}
                  visualizerRef={visualizerRef}
                  storyPanelRef={storyPanelRef}
                  sceneId={sceneId}
                  showStoryPanel={selectedProjectType === "story"}
                  selectedStory={selectedStory}
                  installableStoryBlocks={installableStoryBlocks}
                  currentCamera={currentCamera}
                  widgetAlignEditorActivated={showWidgetEditor}
                  selectedWidgetArea={selectedWidgetArea}
                  onStoryBlockMove={onStoryBlockMove}
                  onCameraChange={handleCameraUpdate}
                  onSketchTypeChange={handleSketchTypeChange}
                  onSketchFeatureCreate={handleSketchFeatureCreate}
                  onLayerStyleSelect={handleLayerStyleSelect}
                  onSceneSettingSelect={handleSceneSettingSelect}
                  onVisualizerReady={handleIsVisualizerUpdate}
                  onLayerSelect={handleLayerSelect}
                  setSelectedStoryPageId={setSelectedStoryPageId}
                  selectWidgetArea={selectWidgetArea}
                />
              </VisualizerWrapper>
              {bottomPanel && (
                <Resizable
                  direction="horizontal"
                  gutter="start"
                  initialSize={spacing.bottomPanelMinHeight}
                  minSize={spacing.bottomPanelMinHeight}
                  maxSize={spacing.bottomPanelMaxHeight}
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
              initialSize={spacing.propertyMenuWidth}
              minSize={spacing.propertyMenuMinWidth}
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
