import styled from "@emotion/styled";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { useAtom } from "jotai";
import { FC } from "react";

import CursorStatus from "../CursorStatus";
import Navbar, { Tab } from "../Navbar";

import { useWidgetsViewDevice, usePublishViewDevice } from "./atoms";
import useHooks from "./hooks";
import Map from "./Map";
import { MapPageProvider } from "./Map/context";
import DataSourceLayerCreator from "./Map/DataSourceLayerCreator";
import PlateauAssetLayerCreator from "./Map/PlateauAssetLayerCreator";
import SketchLayerCreator from "./Map/SketchLayerCreator";
import {
  showDataSourceLayerCreatorAtom,
  showPlateauAssetLayerCreatorAtom,
  showSketchLayerCreatorAtom
} from "./Map/state";
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
    activeSubProject,
    selectedStory,
    installableStoryBlocks,
    showWASEditor,
    selectedWidgetArea,
    handleStoryBlockMove,
    handleSketchTypeChange,
    handleSketchFeatureCreate,
    handleSketchFeatureUpdate,
    handleIsVisualizerUpdate,
    handleCoreLayerSelectFromMap,
    selectStoryPage,
    selectWidgetArea,
    handleLayerAdd,
    mapPageValue,
    storyPageValue,
    widgetsPageValue,
    publishPageValue,
    handleCoreAPIReady
  } = useHooks({ sceneId, tab, projectId });

  const [widgetsViewDevice] = useWidgetsViewDevice();
  const [publishViewDevice] = usePublishViewDevice();

  const [showDataSourceLayerCreator, setShowDataSourceLayerCreator] = useAtom(
    showDataSourceLayerCreatorAtom
  );
  const closeDataSourceLayerCreator = () => {
    setShowDataSourceLayerCreator(false);
  };

  const [showSketchLayerCreator, setShowSketchLayerCreator] = useAtom(
    showSketchLayerCreatorAtom
  );
  const closeSketchLayerCreator = () => {
    setShowSketchLayerCreator(false);
  };

  const [showPlateauAssetLayerCreator, setShowPlateauAssetLayerCreator] =
    useAtom(showPlateauAssetLayerCreatorAtom);
  const closePlateauAssetLayerCreator = () => {
    setShowPlateauAssetLayerCreator(false);
  };

  return (
    <Wrapper data-testid="editor-wrapper">
      <Navbar
        sceneId={sceneId}
        projectId={projectId}
        workspaceId={workspaceId}
        currentTab={tab}
        data-testid="editor-navbar"
      />
      <Content data-testid="editor-content">
        <VisualizerArea
          style={{ ...visualizerSize }}
          data-testid="editor-visualizer-area"
        >
          <EditorVisualizer
            inEditor={tab !== "publish"}
            forceDevice={
              tab === "widgets"
                ? widgetsViewDevice
                : tab === "publish"
                  ? publishViewDevice
                  : undefined
            }
            selectedLayer={selectedLayer}
            visualizerRef={visualizerRef}
            storyPanelRef={storyPanelRef}
            isVisualizerResizing={isVisualizerResizing}
            sceneId={sceneId}
            showStoryPanel={activeSubProject?.type === "story"}
            selectedStory={selectedStory}
            installableStoryBlocks={installableStoryBlocks}
            widgetAlignEditorActivated={showWASEditor}
            selectedWidgetArea={selectedWidgetArea}
            onStoryBlockMove={handleStoryBlockMove}
            onSketchTypeChange={handleSketchTypeChange}
            onSketchFeatureCreate={handleSketchFeatureCreate}
            onSketchFeatureUpdate={handleSketchFeatureUpdate}
            onVisualizerReady={handleIsVisualizerUpdate}
            onCoreLayerSelect={handleCoreLayerSelectFromMap}
            onCoreAPIReady={handleCoreAPIReady}
            setSelectedStoryPageId={selectStoryPage}
            selectWidgetArea={selectWidgetArea}
            data-testid="editor-visualizer"
          />
        </VisualizerArea>
        <Workbench data-testid="editor-workbench">
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
      {showDataSourceLayerCreator && (
        <DataSourceLayerCreator
          sceneId={sceneId}
          onClose={closeDataSourceLayerCreator}
          onSubmit={handleLayerAdd}
          data-testid="editor-datasource-layer-creator"
        />
      )}
      {showSketchLayerCreator && (
        <SketchLayerCreator
          onSubmit={handleLayerAdd}
          sceneId={sceneId}
          onClose={closeSketchLayerCreator}
          data-testid="editor-sketch-layer-creator"
        />
      )}
      {showPlateauAssetLayerCreator && (
        <PlateauAssetLayerCreator
          sceneId={sceneId}
          onClose={closePlateauAssetLayerCreator}
          onLayerAdd={handleLayerAdd}
          data-testid="editor-plateau-asset-layer-creator"
        />
      )}
      <CursorStatus data-testid="editor-cursor-status" />
    </Wrapper>
  );
};

export default Editor;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  height: "100vh",
  width: "100vw",
  color: theme.content.main
}));

const Content = styled("div")(() => ({
  position: css.position.relative,
  flexGrow: 1,
  height: 0
}));

const Workbench = styled("div")(() => ({
  position: css.position.absolute,
  width: "100%",
  height: "100%",
  pointerEvents: css.pointerEvents.none
}));

const VisualizerArea = styled("div")(({ theme }) => ({
  position: css.position.absolute,
  borderRadius: theme.radius.small,
  overflow: css.overflow.hidden
}));
