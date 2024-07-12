import { useEffect, useMemo } from "react";

import { commonReearth } from "../pluginAPI/commonReearth";
import { Context, Props } from "../types";

import useCamera from "./useCamera";
import useCommonEvents from "./useCommonEvents";
import useData from "./useData";
import useExtension from "./useExtension";
import useLayers from "./useLayers";
import useSketch from "./useSketch";
import useTimeline from "./useTimeline";
import useViewer from "./useViewer";

export default function ({
  engineName,
  mapRef,
  viewerProperty,
  inEditor,
  built,
  viewport,
  selectedLayer,
  selectedFeature,
  alignSystem,
  floatingWidgets,
  interactionMode,
  timelineManagerRef,
  selectedStory,
  overrideInteractionMode,
  overrideViewerProperty,
  onLayerEdit,
  onLayerSelectWithRectStart,
  onLayerSelectWithRectMove,
  onLayerSelectWithRectEnd,
  onSketchPluginFeatureCreate,
  onSketchTypeChange,
  onLayerVisibility,
  onLayerLoad,
  onCameraForceHorizontalRollChange,
}: Props) {
  const {
    getViewerProperty,
    overrideViewerPropertyCommon,
    getViewport,
    captureScreen,
    getInteractionMode,
    getInEditor,
    getIsBuilt,
    getLocationFromScreenCoordinate,
    getScreenCoordinateFromPosition,
    getTerrainHeightAsync,
    getGlobeHeight,
    getGlobeHeightByCamera,
    cartographicToCartesian,
    cartesianToCartographic,
    transformByOffsetOnScreen,
    isPositionVisibleOnGlobe,
  } = useViewer({
    viewerProperty,
    overrideViewerProperty,
    viewport,
    mapRef,
    interactionMode,
    overrideInteractionMode,
    inEditor,
    built,
  });

  const {
    getCameraPosition,
    getCameraFov,
    getCameraViewport,
    zoomIn,
    zoomOut,
    setView,
    flyTo,
    flyToBoundingBox,
    getGlobeIntersection,
    enableScreenSpaceCameraController,
    overrideScreenSpaceCameraController,
    lookAt,
    rotateAround,
    rotateRight,
    orbit,
    move,
    moveOverTerrain,
    enableForceHorizontalRoll,
  } = useCamera({
    mapRef,
    onCameraForceHorizontalRollChange,
  });

  const { getTimeline } = useTimeline({ timelineManagerRef });

  const {
    getLayers,
    hideLayer,
    showLayer,
    addLayer,
    findFeatureById,
    findFeaturesByIds,
    layersInViewport,
    selectLayer,
    selectFeature,
    selectFeatures,
    getSelectedLayer,
    getSelectedFeature,
    getFeaturesInScreenRect,
    bringToFront,
    sendToBack,
  } = useLayers({ mapRef, selectedLayer, selectedFeature });

  const { getSketchTool, setSketchTool, getSketchOptions, overrideSketchOptions } = useSketch({
    mapRef,
  });

  const { pluginInstances, getExtensionList } = useExtension({
    alignSystem,
    floatingWidgets,
    selectedLayer,
    selectedStory,
  });

  const { commonEvents } = useCommonEvents({
    mapRef,
    timelineManagerRef,
    selectedLayer,
    selectedFeature,
    viewport,
    onLayerEdit,
    onLayerVisibility,
    onLayerLoad,
    onLayerSelectWithRectStart,
    onLayerSelectWithRectMove,
    onLayerSelectWithRectEnd,
    onSketchPluginFeatureCreate,
    onSketchTypeChange,
  });

  const { clientStorage } = useData();

  const value = useMemo<Context>(
    () => ({
      reearth: commonReearth({
        engineName: engineName ?? "",
        // viewer
        getViewerProperty,
        overrideViewerProperty: overrideViewerPropertyCommon,
        getViewport,
        captureScreen,
        getInteractionMode,
        getInEditor,
        getIsBuilt,
        // viewer tools
        getLocationFromScreenCoordinate,
        getScreenCoordinateFromPosition,
        getTerrainHeightAsync,
        getGlobeHeight,
        getGlobeHeightByCamera,
        cartographicToCartesian,
        cartesianToCartographic,
        transformByOffsetOnScreen,
        isPositionVisibleOnGlobe,
        // camera
        getCameraPosition,
        getCameraFov,
        getCameraViewport,
        zoomIn,
        zoomOut,
        setView,
        flyTo,
        flyToBoundingBox,
        getGlobeIntersection,
        enableScreenSpaceCameraController,
        overrideScreenSpaceCameraController,
        lookAt,
        rotateAround,
        rotateRight,
        orbit,
        move,
        moveOverTerrain,
        enableForceHorizontalRoll,
        // timeline
        getTimeline,
        // layers,
        getLayers,
        hideLayer,
        showLayer,
        addLayer,
        findFeatureById,
        findFeaturesByIds,
        layersInViewport,
        selectLayer,
        selectFeature,
        selectFeatures,
        getSelectedLayer,
        getSelectedFeature,
        getFeaturesInScreenRect,
        bringToFront,
        sendToBack,
        // sketch
        getSketchTool,
        setSketchTool,
        getSketchOptions,
        overrideSketchOptions,
        // extension
        getExtensionList,

        events: commonEvents,
      }),
      overrideViewerProperty,
      pluginInstances,
      clientStorage,
      timelineManagerRef,
    }),
    [
      engineName,
      // viewer
      getViewerProperty,
      overrideViewerPropertyCommon,
      getViewport,
      captureScreen,
      getInteractionMode,
      getInEditor,
      getIsBuilt,
      // viewer tools
      getLocationFromScreenCoordinate,
      getScreenCoordinateFromPosition,
      getTerrainHeightAsync,
      getGlobeHeight,
      getGlobeHeightByCamera,
      cartographicToCartesian,
      cartesianToCartographic,
      transformByOffsetOnScreen,
      isPositionVisibleOnGlobe,
      // camera
      getCameraPosition,
      getCameraFov,
      getCameraViewport,
      zoomIn,
      zoomOut,
      setView,
      flyTo,
      flyToBoundingBox,
      getGlobeIntersection,
      enableScreenSpaceCameraController,
      overrideScreenSpaceCameraController,
      lookAt,
      rotateAround,
      rotateRight,
      orbit,
      move,
      moveOverTerrain,
      enableForceHorizontalRoll,
      // timeline
      getTimeline,
      // layers
      getLayers,
      hideLayer,
      showLayer,
      addLayer,
      findFeatureById,
      findFeaturesByIds,
      layersInViewport,
      selectLayer,
      selectFeature,
      selectFeatures,
      getSelectedLayer,
      getSelectedFeature,
      getFeaturesInScreenRect,
      bringToFront,
      sendToBack,
      // sketch
      getSketchTool,
      setSketchTool,
      getSketchOptions,
      overrideSketchOptions,
      // extension
      getExtensionList,
      // events
      commonEvents,
      // others
      overrideViewerProperty,
      pluginInstances,
      clientStorage,
      timelineManagerRef,
    ],
  );

  // expose plugin API for developers
  useEffect(() => {
    window.reearth = value.reearth;
    return () => {
      delete window.reearth;
    };
  }, [value]);

  return value;
}
