import styled from "@emotion/styled";
import { FC, useMemo } from "react";

import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";

// import useHooks from "../Editor/hooks";
import Navbar, { Tab } from "../Navbar";

import useEditorVisualizer from "./hooks/useEditorVisualizer";
import useLayers from "./hooks/useLayers";
import useLayerStyles from "./hooks/useLayerStyles";
import useProperty from "./hooks/useProperty";
import useScene from "./hooks/useScene";
import useSketch from "./hooks/useSketch";
import useStorytelling from "./hooks/useStorytelling";
import useUI from "./hooks/useUI";
import useWidgets from "./hooks/useWidgets";
import Map from "./Map";
import DataSourceLayerCreator from "./Map/DataSourceLayerCreator";
import SketchLayerCreator from "./Map/SketchLayerCreator";
import Publish from "./Publish";
import { PublishPageProvider } from "./Publish/publishPageContext";
import Story from "./Story";
import { StoryPageProvider } from "./Story/storyPageContext";
import EditorVisualizer from "./Visualizer";
import Widgets from "./Widgets";
import { WidgetsPageProvider } from "./Widgets/widgetsPageContext";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
};

// const spacing = {
//   propertyMenuWidth: 308,
//   propertyMenuMinWidth: 200,
//   bottomPanelMinHeight: 136,
//   bottomPanelMaxHeight: 232,
// };

const NewEditor: FC<Props> = ({ sceneId, projectId, workspaceId, tab }) => {
  const {
    visualizerRef,
    isVisualizerReady,
    handleIsVisualizerUpdate,
    visualizerSize,
    handleVisuzlierResize,
    currentCamera,
    handleCameraUpdate,
    handleFlyTo,
  } = useEditorVisualizer();

  const {
    nlsLayers,
    selectedLayer,
    ignoreCoreLayerUnselect,
    handleCoreLayerSelect,
    // for layers tab
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerNameUpdate,
    handleLayerVisibilityUpdate,
    handleLayerConfigUpdate,
  } = useLayers({
    sceneId,
    isVisualizerReady,
    visualizerRef,
  });

  const {
    handleSketchTypeChange,
    handleSketchFeatureCreate,
    // for map tab
    sketchType,
    handleGeoJsonFeatureUpdate,
  } = useSketch({
    tab,
    nlsLayers,
    selectedLayer: selectedLayer?.layer,
    ignoreCoreLayerUnselect,
    visualizerRef,
  });

  const {
    handleSceneSettingSelect,
    // for map tab
    scene,
    selectedSceneSetting,
    sceneSettings,
  } = useScene({
    sceneId,
  });

  const {
    handleLayerStyleSelect,
    // for map tab
    layerStyles,
    selectedLayerStyle,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleValueUpdate,
  } = useLayerStyles({ sceneId });

  const {
    currentProjectType,
    handleProjectTypeChange,
    // for ui
    handleLayerSelectFromUI,
    handleCoreLayerSelectFromUI,
    handleSceneSettingSelectFromUI,
    handleLayerStyleSelectFromUI,
    dataSourceLayerCreatorShown,
    openDataSourceLayerCreator,
    closeDataSourceLayerCreator,
    sketchLayerCreatorShown,
    openSketchLayerCreator,
    closeSketchLayerCreator,
    selectedDevice,
    handleDeviceChange,
  } = useUI({
    tab,
    handleLayerSelect,
    handleCoreLayerSelect,
    handleSceneSettingSelect,
    handleLayerStyleSelect,
  });

  const {
    selectedStory,
    storyPanelRef,
    installableStoryBlocks,
    currentStoryPage,
    handleCurrentStoryPageChange,
    // handlePageDuplicate // not in use
    handleStoryPageDelete,
    handleStoryPageAdd,
    handleStoryPageMove,
    handleStoryPageUpdate,
    handleStoryBlockMove,
    selectStoryPage,
  } = useStorytelling({
    sceneId,
  });

  const {
    showWASEditor,
    handleShowWASEditorToggle,
    selectedWidgetArea,
    selectWidgetArea,
    selectedWidget,
    selectWidget,
  } = useWidgets({ tab });

  const { handlePropertyValueUpdate } = useProperty();

  const storyPageValue = useMemo(
    () => ({
      onVisualizerResize: handleVisuzlierResize,
      storyPages: selectedStory?.pages ?? [],
      selectedStoryPage: currentStoryPage,
      onPageSelect: handleCurrentStoryPageChange,
      onPageAdd: handleStoryPageAdd,
      onPageDelete: handleStoryPageDelete,
      onPageMove: handleStoryPageMove,
      onPropertyUpdate: handlePropertyValueUpdate,
      //
      sceneId,
      currentCamera, // TODO: Camera manager
      layers: nlsLayers,
      tab,
      onFlyTo: handleFlyTo,
      onPageUpdate: handleStoryPageUpdate,
    }),
    [
      handleVisuzlierResize,
      selectedStory,
      currentStoryPage,
      handleCurrentStoryPageChange,
      handleStoryPageAdd,
      handleStoryPageDelete,
      handleStoryPageMove,
      handlePropertyValueUpdate,
      sceneId,
      currentCamera,
      nlsLayers,
      tab,
      handleFlyTo,
      handleStoryPageUpdate,
    ],
  );

  const widgetsPageValue = useMemo(
    () => ({
      onVisualizerResize: handleVisuzlierResize,
      showWidgetEditor: showWASEditor,
      onShowWidgetEditor: handleShowWASEditorToggle,
      selectedDevice,
      onDeviceChange: handleDeviceChange,
      setSelectedWidgetArea: selectWidgetArea,
      sceneId,
      selectedWidget,
      setSelectedWidget: selectWidget,
      selectedWidgetArea,
      currentCamera, // TODO: Camera manager
      onFlyTo: handleFlyTo,
    }),
    [
      handleVisuzlierResize,
      showWASEditor,
      handleShowWASEditorToggle,
      selectedDevice,
      handleDeviceChange,
      selectWidgetArea,
      sceneId,
      selectedWidget,
      selectWidget,
      selectedWidgetArea,
      currentCamera,
      handleFlyTo,
    ],
  );

  const publishPageValue = useMemo(
    () => ({
      onVisualizerResize: handleVisuzlierResize,
      id: currentProjectType === "story" ? selectedStory?.id : projectId,
      sceneId,
      selectedProjectType: currentProjectType,
      onProjectTypeChange: handleProjectTypeChange,
    }),
    [
      handleVisuzlierResize,
      sceneId,
      currentProjectType,
      selectedStory?.id,
      projectId,
      handleProjectTypeChange,
    ],
  );

  return (
    <DndProvider>
      <Wrapper>
        <Navbar
          sceneId={sceneId}
          projectId={projectId}
          workspaceId={workspaceId}
          currentTab={tab}
        />
        <Content>
          <VisualizerArea style={{ ...visualizerSize }}>
            <EditorVisualizer
              inEditor={tab !== "publish"}
              selectedLayer={selectedLayer}
              visualizerRef={visualizerRef}
              storyPanelRef={storyPanelRef}
              sceneId={sceneId}
              showStoryPanel={currentProjectType === "story"}
              selectedStory={selectedStory}
              installableStoryBlocks={installableStoryBlocks}
              currentCamera={currentCamera}
              widgetAlignEditorActivated={showWASEditor}
              selectedWidgetArea={selectedWidgetArea}
              onStoryBlockMove={handleStoryBlockMove}
              onCameraChange={handleCameraUpdate}
              onSketchTypeChange={handleSketchTypeChange}
              onSketchFeatureCreate={handleSketchFeatureCreate}
              onVisualizerReady={handleIsVisualizerUpdate}
              onCoreLayerSelect={handleCoreLayerSelectFromUI}
              setSelectedStoryPageId={selectStoryPage}
              selectWidgetArea={selectWidgetArea}
            />
          </VisualizerArea>
          <Workbench>
            {tab === "map" && (
              <Map
                onVisualizerResize={handleVisuzlierResize}
                sketchEnabled={!!selectedLayer?.layer?.isSketch}
                sketchType={sketchType}
                onSketchTypeChange={handleSketchTypeChange}
                scene={scene}
                selectedSceneSetting={selectedSceneSetting}
                onSceneSettingSelect={handleSceneSettingSelectFromUI}
                layers={nlsLayers}
                selectedLayerId={selectedLayer?.layer?.id}
                onLayerDelete={handleLayerDelete}
                onLayerNameUpdate={handleLayerNameUpdate}
                onLayerSelect={handleLayerSelectFromUI}
                onDataSourceLayerCreatorOpen={openDataSourceLayerCreator}
                onSketchLayerCreatorOpen={openSketchLayerCreator}
                onLayerVisibilityUpate={handleLayerVisibilityUpdate}
                onFlyTo={handleFlyTo}
                layerStyles={layerStyles}
                selectedLayerStyleId={selectedLayerStyle?.id}
                onLayerStyleAdd={handleLayerStyleAdd}
                onLayerStyleDelete={handleLayerStyleDelete}
                onLayerStyleNameUpdate={handleLayerStyleNameUpdate}
                onLayerStyleSelect={handleLayerStyleSelectFromUI}
                sceneId={sceneId}
                sceneSettings={sceneSettings}
                currentCamera={currentCamera}
                selectedLayer={selectedLayer}
                onLayerStyleValueUpdate={handleLayerStyleValueUpdate}
                onLayerConfigUpdate={handleLayerConfigUpdate}
                onGeoJsonFeatureUpdate={handleGeoJsonFeatureUpdate}
              />
            )}
            {tab === "story" && (
              <StoryPageProvider value={storyPageValue}>
                <Story />
              </StoryPageProvider>
            )}
            {tab === "widgets" && (
              <WidgetsPageProvider value={widgetsPageValue}>
                <Widgets />
              </WidgetsPageProvider>
            )}
            {tab === "publish" && (
              <PublishPageProvider value={publishPageValue}>
                <Publish />
              </PublishPageProvider>
            )}
          </Workbench>
        </Content>
        {dataSourceLayerCreatorShown && (
          <DataSourceLayerCreator
            sceneId={sceneId}
            onClose={closeDataSourceLayerCreator}
            onSubmit={handleLayerAdd}
          />
        )}
        {sketchLayerCreatorShown && (
          <SketchLayerCreator
            onSubmit={handleLayerAdd}
            sceneId={sceneId}
            onClose={closeSketchLayerCreator}
            layerStyles={layerStyles}
          />
        )}
      </Wrapper>
    </DndProvider>
  );
};

export default NewEditor;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100vw",
  color: theme.content.main,
}));

const Content = styled("div")(() => ({
  position: "relative",
  flexGrow: 1,
  height: 0,
}));

const Workbench = styled("div")(() => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
}));

const VisualizerArea = styled("div")(({ theme }) => ({
  position: "absolute",
  borderRadius: theme.radius.small,
  overflow: "hidden",
}));
