import styled from "@emotion/styled";
import { FC } from "react";

import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";

import useHooks from "../Editor/hooks";
import useLayers from "../Editor/useLayers";
import useLayerStyles from "../Editor/useLayerStyles";
import useScene from "../Editor/useScene";
import useSketch from "../Editor/useSketch";
import useStorytelling from "../Editor/useStorytelling";
import EditorVisualizer from "../Editor/Visualizer";
import Navbar, { Tab } from "../Navbar";

import Map from "./Map";
import Publish from "./Publish";
import Story from "./Story";
import useVisualizerSize from "./useVisualizerSize";
import Widgets from "./Widgets";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
};

const NewEditor: FC<Props> = ({ sceneId, projectId, workspaceId, tab }) => {
  const {
    visualizerRef,
    isVisualizerReady,
    // selectedDevice,
    selectedProjectType,
    // visualizerWidth,
    showWidgetEditor,
    // showDataSourceManager,
    currentCamera,
    // showSketchLayerManager,
    // selectedWidget,
    selectedWidgetArea,
    // handleDataSourceManagerCloser,
    // handleDataSourceManagerOpener,
    // handleSketchLayerManagerCloser,
    // handleSketchLayerManagerOpener,
    // handleDeviceChange,
    // handleProjectTypeChange,
    // handleWidgetEditorToggle,
    // handleFlyTo,
    handleCameraUpdate,
    // handlePropertyValueUpdate,
    handleIsVisualizerUpdate,
    // setSelectedWidget,
    selectWidgetArea,
  } = useHooks({ sceneId, tab });

  const {
    nlsLayers,
    selectedLayer,
    selectedLayerId,
    // handleLayerAdd,
    // handleLayerDelete,
    // handleLayerSelect,
    // handleLayerNameUpdate,
    handleLayerConfigUpdate,
    // handleLayerVisibilityUpdate,
    setSelectedLayerId,
  } = useLayers({
    sceneId,
    isVisualizerReady,
    visualizerRef,
  });

  const {
    selectedStory,
    storyPanelRef,
    // currentPage,
    installableStoryBlocks,
    // handleCurrentPageChange,
    // handlePageDuplicate,
    // handlePageDelete,
    // handlePageAdd,
    // handlePageMove,
    handleStoryBlockMove: onStoryBlockMove,
    // handlePageUpdate,
    setSelectedStoryPageId,
  } = useStorytelling({
    sceneId,
  });

  const {
    // sketchType,
    handleSketchTypeChange,
    handleSketchFeatureCreate,
    // handleGeoJsonFeatureUpdate,
  } = useSketch({
    tab,
    nlsLayers,
    selectedLayer,
    visualizerRef,
    handleLayerConfigUpdate,
  });

  const {
    // layerStyles,
    // selectedLayerStyle,
    setSelectedLayerStyleId,
    // handleLayerStyleAdd,
    // handleLayerStyleDelete,
    // handleLayerStyleNameUpdate,
    // handleLayerStyleValueUpdate,
    // handleLayerStyleSelect,
  } = useLayerStyles({ sceneId });

  const {
    // scene,
    // selectedSceneSetting,
    // sceneSettings,
    handleSceneSettingSelect,
  } = useScene({
    sceneId,
  });

  const { visualizerSize, handleVisuzlierResize } = useVisualizerSize();

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
              selectedLayer={selectedLayerId}
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
              setIsVisualizerReady={handleIsVisualizerUpdate}
              setSelectedLayer={setSelectedLayerId}
              setSelectedLayerStyle={setSelectedLayerStyleId}
              setSelectedSceneSetting={handleSceneSettingSelect}
              setSelectedStoryPageId={setSelectedStoryPageId}
              selectWidgetArea={selectWidgetArea}
            />
          </VisualizerArea>
          <Workbench>
            {tab === "map" && <Map onVisualizerResize={handleVisuzlierResize} />}
            {tab === "story" && <Story onVisualizerResize={handleVisuzlierResize} />}
            {tab === "widgets" && <Widgets onVisualizerResize={handleVisuzlierResize} />}
            {tab === "publish" && <Publish onVisualizerResize={handleVisuzlierResize} />}
          </Workbench>
        </Content>
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
