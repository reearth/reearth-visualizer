import { useMemo } from "react";

import { Tab } from "../../Navbar";

import useEditorVisualizer from "./useEditorVisualizer";
import useLayers from "./useLayers";
import useLayerStyles from "./useLayerStyles";
import useProperty from "./useProperty";
import useScene from "./useScene";
import useSketch from "./useSketch";
import useStorytelling from "./useStorytelling";
import useUI from "./useUI";
import useWidgets from "./useWidgets";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
};

export default ({ sceneId, projectId, tab }: Props) => {
  const {
    visualizerRef,
    isVisualizerReady,
    handleIsVisualizerUpdate,
    visualizerSize,
    handleVisuzlierResize,
    isVisualizerResizing,
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

  const mapPageValue = useMemo(
    () => ({
      onVisualizerResize: handleVisuzlierResize,
      sketchEnabled: !!selectedLayer?.layer?.isSketch,
      sketchType,
      onSketchTypeChange: handleSketchTypeChange,
      scene,
      selectedSceneSetting,
      onSceneSettingSelect: handleSceneSettingSelectFromUI,
      layers: nlsLayers,
      selectedLayerId: selectedLayer?.layer?.id,
      onLayerDelete: handleLayerDelete,
      onLayerNameUpdate: handleLayerNameUpdate,
      onLayerSelect: handleLayerSelectFromUI,
      onDataSourceLayerCreatorOpen: openDataSourceLayerCreator,
      onSketchLayerCreatorOpen: openSketchLayerCreator,
      onLayerVisibilityUpate: handleLayerVisibilityUpdate,
      onFlyTo: handleFlyTo,
      layerStyles,
      selectedLayerStyleId: selectedLayerStyle?.id,
      onLayerStyleAdd: handleLayerStyleAdd,
      onLayerStyleDelete: handleLayerStyleDelete,
      onLayerStyleNameUpdate: handleLayerStyleNameUpdate,
      onLayerStyleSelect: handleLayerStyleSelectFromUI,
      sceneId,
      sceneSettings,
      currentCamera,
      selectedLayer,
      onLayerStyleValueUpdate: handleLayerStyleValueUpdate,
      onLayerConfigUpdate: handleLayerConfigUpdate,
      onGeoJsonFeatureUpdate: handleGeoJsonFeatureUpdate,
    }),
    [
      handleVisuzlierResize,
      sketchType,
      scene,
      selectedSceneSetting,
      nlsLayers,
      selectedLayer,
      layerStyles,
      sceneSettings,
      currentCamera,
      selectedLayerStyle,
      sceneId,
      handleSketchTypeChange,
      handleSceneSettingSelectFromUI,
      handleLayerDelete,
      handleLayerNameUpdate,
      handleLayerSelectFromUI,
      openDataSourceLayerCreator,
      openSketchLayerCreator,
      handleLayerVisibilityUpdate,
      handleFlyTo,
      handleLayerStyleAdd,
      handleLayerStyleDelete,
      handleLayerStyleNameUpdate,
      handleLayerStyleSelectFromUI,
      handleLayerStyleValueUpdate,
      handleLayerConfigUpdate,
      handleGeoJsonFeatureUpdate,
    ],
  );

  return {
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
  };
};
