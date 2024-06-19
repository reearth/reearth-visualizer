import styled from "@emotion/styled";
import { FC } from "react";

import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";

import Navbar, { Tab } from "../Navbar";

import useHooks from "./hooks";
import Map from "./Map";
import { MapPageProvider } from "./Map/context";
import DataSourceLayerCreator from "./Map/DataSourceLayerCreator";
import SketchLayerCreator from "./Map/SketchLayerCreator";
import Publish from "./Publish";
import { PublishPageProvider } from "./Publish/context";
import Story from "./Story";
import { StoryPageProvider } from "./Story/context";
import EditorVisualizer from "./Visualizer";
import Widgets from "./Widgets";
import { WidgetsPageProvider } from "./Widgets/context";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
};

const Editor: FC<Props> = ({ sceneId, projectId, workspaceId, tab }) => {
  const {
    visualizerSize,
    isVisualizerResizing,
    selectedLayer,
    visualizerRef,
    storyPanelRef,
    currentProjectType,
    selectedStory,
    installableStoryBlocks,
    currentCamera,
    showWASEditor,
    selectedWidgetArea,
    handleStoryBlockMove,
    handleCameraUpdate,
    handleSketchTypeChange,
    handleSketchFeatureCreate,
    handleIsVisualizerUpdate,
    handleCoreLayerSelectFromUI,
    selectStoryPage,
    selectWidgetArea,
    mapPageValue,
    storyPageValue,
    widgetsPageValue,
    publishPageValue,
    dataSourceLayerCreatorShown,
    closeDataSourceLayerCreator,
    handleLayerAdd,
    sketchLayerCreatorShown,
    closeSketchLayerCreator,
    layerStyles,
  } = useHooks({ sceneId, tab, projectId });

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
              isVisualizerResizing={isVisualizerResizing}
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
              <MapPageProvider value={mapPageValue}>
                <Map />
              </MapPageProvider>
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

export default Editor;

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
