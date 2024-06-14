import styled from "@emotion/styled";
import { FC, useCallback, useState } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";
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

  const [visualizerSize, setVisualizerSize] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const handleVisuzlierResize = useCallback((size: AreaSize) => {
    // Visualizer area does not have a padding
    setVisualizerSize({ ...size, width: size.width + 4, height: size.height + 4 });
  }, []);

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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  color: ${({ theme }) => theme.content.main};
`;

const Content = styled.div`
  position: relative;
  flex-grow: 1;
  height: 0;
`;

const Workbench = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const VisualizerArea = styled.div`
  position: absolute;
`;
