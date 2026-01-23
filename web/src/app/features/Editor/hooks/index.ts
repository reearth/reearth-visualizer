import { useCallback, useMemo } from "react";

import { Tab } from "../../Navbar";
import { MapPageContextType } from "../Map/context";
import { PublishPageContextType } from "../Publish/context";
import { StoryPageContextType } from "../Story/context";
import { WidgetsPageContextType } from "../Widgets/context";

import useEditorVisualizer from "./useEditorVisualizer";
import useLayers from "./useLayers";
import useLayerStyles from "./useLayerStyles";
import usePlateau from "./usePlateau";
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
    handleVisualizerResize,
    isVisualizerResizing,
    handleFlyTo
  } = useEditorVisualizer({
    tab
  });

  const {
    nlsLayers,
    selectedLayer,
    selectedFeature,
    ignoreCoreLayerUnselect,
    layerId,
    handleCoreLayerSelect,
    // for layers tab
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerNameUpdate,
    handleLayerVisibilityUpdate,
    handleLayerConfigUpdate,
    handleLayerMove,
    handleCustomPropertySchemaClick,
    handleCustomPropertySchemaUpdate,
    handleChangeCustomPropertyTitle,
    handleRemoveCustomProperty
  } = useLayers({
    sceneId,
    isVisualizerReady,
    visualizerRef
  });

  const {
    selectedSketchFeature,
    handleSketchTypeChange,
    handleSketchFeatureCreate,
    handleSketchFeatureUpdate,
    sketchType,
    handleGeoJsonFeatureUpdate,
    handleGeoJsonFeatureDelete,
    sketchEditingFeature,
    handleSketchGeometryEditStart,
    handleSketchGeometryEditCancel,
    handleSketchGeometryEditApply,
    initSketch
  } = useSketch({
    tab,
    nlsLayers,
    selectedLayer,
    selectedFeature,
    ignoreCoreLayerUnselect,
    visualizerRef
  });

  const {
    handleSceneSettingSelect,
    scene,
    selectedSceneSetting,
    sceneSettings
  } = useScene({
    sceneId
  });

  const {
    handleLayerStyleSelect,
    layerStyles,
    selectedLayerStyle,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleValueUpdate
  } = useLayerStyles({ sceneId });

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
    selectStoryPage
  } = useStorytelling({
    sceneId
  });

  const {
    activeSubProject,
    handleActiveSubProjectChange,
    handleLayerSelectFromUI,
    handleCoreLayerSelectFromMap,
    handleSceneSettingSelectFromUI
  } = useUI({
    projectId,
    storyId: selectedStory?.id,
    tab,
    handleLayerSelect,
    handleCoreLayerSelect,
    handleSceneSettingSelect,
    handleSketchTypeChange,
    handleSketchGeometryEditCancel
  });

  const {
    showWASEditor,
    handleShowWASEditorToggle,
    selectedWidgetArea,
    selectWidgetArea,
    selectedWidget,
    selectWidget
  } = useWidgets({ tab });

  const { handlePropertyValueUpdate } = useProperty();

  const mapPageValue: MapPageContextType = useMemo(
    () => ({
      visualizerRef,
      handleVisualizerResize,
      scene,
      selectedSceneSetting,
      handleSceneSettingSelect: handleSceneSettingSelectFromUI,
      layers: nlsLayers,
      selectedLayerId: selectedLayer?.layer?.id,
      handleLayerDelete,
      handleLayerNameUpdate,
      handleLayerMove,
      handleLayerSelect: handleLayerSelectFromUI,
      handleLayerVisibilityUpdate,
      handleFlyTo,
      sketchEnabled: !!selectedLayer?.layer?.isSketch,
      selectedSketchFeature,
      sketchType,
      handleSketchTypeChange,
      sketchEditingFeature,
      handleSketchGeometryEditStart,
      handleSketchGeometryEditCancel,
      handleSketchGeometryEditApply,
      sceneSettings,
      layerStyles,
      sceneId,
      selectedLayerStyleId: selectedLayerStyle?.id,
      selectedLayer,
      selectedFeature,
      handleLayerStyleValueUpdate,
      handleLayerConfigUpdate,
      handleGeoJsonFeatureUpdate,
      handleGeoJsonFeatureDelete,
      handleLayerStyleAdd,
      handleLayerStyleDelete,
      handleLayerStyleNameUpdate,
      handleLayerStyleSelect,
      layerId,
      handleCustomPropertySchemaClick,
      handleCustomPropertySchemaUpdate,
      handleChangeCustomPropertyTitle,
      handleRemoveCustomProperty
    }),
    [
      visualizerRef,
      handleVisualizerResize,
      scene,
      selectedSceneSetting,
      handleSceneSettingSelectFromUI,
      nlsLayers,
      selectedLayer,
      handleLayerDelete,
      handleLayerNameUpdate,
      handleLayerMove,
      handleLayerSelectFromUI,
      handleLayerVisibilityUpdate,
      handleFlyTo,
      selectedSketchFeature,
      sketchType,
      handleSketchTypeChange,
      sketchEditingFeature,
      handleSketchGeometryEditStart,
      handleSketchGeometryEditCancel,
      handleSketchGeometryEditApply,
      sceneSettings,
      layerStyles,
      sceneId,
      selectedLayerStyle?.id,
      selectedFeature,
      handleLayerStyleValueUpdate,
      handleLayerConfigUpdate,
      handleGeoJsonFeatureUpdate,
      handleGeoJsonFeatureDelete,
      handleLayerStyleAdd,
      handleLayerStyleDelete,
      handleLayerStyleNameUpdate,
      handleLayerStyleSelect,
      layerId,
      handleCustomPropertySchemaClick,
      handleCustomPropertySchemaUpdate,
      handleChangeCustomPropertyTitle,
      handleRemoveCustomProperty
    ]
  );

  const storyPageValue: StoryPageContextType = useMemo(
    () => ({
      handleVisualizerResize,
      storyPages: selectedStory?.pages,
      selectedStoryPage: currentStoryPage,
      handleStoryPageSelect: handleCurrentStoryPageChange,
      handleStoryPageAdd,
      handleStoryPageDelete,
      handleStoryPageMove,
      handlePropertyValueUpdate,
      sceneId,
      layers: nlsLayers,
      tab,
      handleFlyTo,
      handleStoryPageUpdate
    }),
    [
      handleVisualizerResize,
      selectedStory,
      currentStoryPage,
      handleCurrentStoryPageChange,
      handleStoryPageAdd,
      handleStoryPageDelete,
      handleStoryPageMove,
      handlePropertyValueUpdate,
      sceneId,
      nlsLayers,
      tab,
      handleFlyTo,
      handleStoryPageUpdate
    ]
  );

  const widgetsPageValue: WidgetsPageContextType = useMemo(
    () => ({
      handleVisualizerResize,
      showWASEditor,
      handleShowWASEditorToggle,
      selectWidgetArea,
      sceneId,
      selectedWidget,
      selectWidget,
      selectedWidgetArea,
      handleFlyTo
    }),
    [
      handleVisualizerResize,
      showWASEditor,
      handleShowWASEditorToggle,
      selectWidgetArea,
      sceneId,
      selectedWidget,
      selectWidget,
      selectedWidgetArea,
      handleFlyTo
    ]
  );

  const publishPageValue: PublishPageContextType = useMemo(
    () => ({
      sceneId,
      projectId,
      activeSubProject,
      handleActiveSubProjectChange,
      handleVisualizerResize
    }),
    [
      sceneId,
      projectId,
      activeSubProject,
      handleActiveSubProjectChange,
      handleVisualizerResize
    ]
  );

  const handleCoreAPIReady = useCallback(() => {
    initSketch();
  }, [initSketch]);

  usePlateau();

  return {
    visualizerSize,
    isVisualizerResizing,
    selectedLayer,
    selectedFeature,
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
    mapPageValue,
    storyPageValue,
    widgetsPageValue,
    publishPageValue,
    handleLayerAdd,
    layerStyles,
    layers: nlsLayers,
    layerId,
    handleCustomPropertySchemaUpdate,
    handleCoreAPIReady
  };
};
