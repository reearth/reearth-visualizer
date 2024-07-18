import { useEffect, useMemo } from "react";

import { commonReearth } from "../pluginAPI/commonReearth";
import { Context, Props } from "../types";

import useCamera from "./useCamera";
import useData from "./useData";
import useDeprecated from "./useDeprecated";
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
    viewerEventsOn,
    viewerEventsOff,
  } = useViewer({
    viewerProperty,
    overrideViewerProperty,
    viewport,
    mapRef,
    interactionMode,
    overrideInteractionMode,
    inEditor,
    built,
    onLayerSelectWithRectStart,
    onLayerSelectWithRectMove,
    onLayerSelectWithRectEnd,
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
    cameraEventsOn,
    cameraEventsOff,
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
    layersEventsOn,
    layersEventsOff,
  } = useLayers({
    mapRef,
    selectedLayer,
    selectedFeature,
    onLayerEdit,
    onLayerVisibility,
    onLayerLoad,
  });

  const {
    getSketchTool,
    setSketchTool,
    getSketchOptions,
    overrideSketchOptions,
    sketchEventsOn,
    sketchEventsOff,
  } = useSketch({
    mapRef,
    onSketchPluginFeatureCreate,
    onSketchTypeChange,
  });

  const { pluginInstances, getExtensionList } = useExtension({
    alignSystem,
    floatingWidgets,
    selectedLayer,
    selectedStory,
  });

  const { clientStorage } = useData();

  const { deprecated, cameraDeprecated, layersDeprecated, sketchDeprecated } = useDeprecated({
    built,
  });

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
        // viewer events
        viewerEventsOn,
        viewerEventsOff,
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
        // camera events
        cameraEventsOn,
        cameraEventsOff,
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
        // layers events
        layersEventsOn,
        layersEventsOff,
        // sketch
        getSketchTool,
        setSketchTool,
        getSketchOptions,
        overrideSketchOptions,
        // sketch events
        sketchEventsOn,
        sketchEventsOff,
        // extension
        getExtensionList,
        // deprecated
        deprecated,
        cameraDeprecated,
        layersDeprecated,
        sketchDeprecated,
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
      // viewer events
      viewerEventsOn,
      viewerEventsOff,
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
      // camera events
      cameraEventsOn,
      cameraEventsOff,
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
      // layers events
      layersEventsOn,
      layersEventsOff,
      // sketch
      getSketchTool,
      setSketchTool,
      getSketchOptions,
      overrideSketchOptions,
      // sketch events
      sketchEventsOn,
      sketchEventsOff,
      // extension
      getExtensionList,
      // deprecated
      deprecated,
      cameraDeprecated,
      layersDeprecated,
      sketchDeprecated,
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
