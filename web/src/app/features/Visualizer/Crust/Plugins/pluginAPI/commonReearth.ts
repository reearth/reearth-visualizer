import { LazyLayer, MapRef } from "@reearth/core";

import { REEATH_PLUGIN_API_VERSION } from "./constaint";
import { GlobalThis, Reearth } from "./types";
import { openUrlInNewTab } from "./utils";

export type CommonReearth = Omit<
  Reearth,
  "ui" | "modal" | "popup" | "extension" | "data"
> & {
  extension: Pick<Reearth["extension"], "list">;
};

declare global {
  interface Window {
    reearth?: CommonReearth;
  }
}

export function commonReearth({
  engineName,
  // viewer
  getViewerProperty,
  overrideViewerProperty,
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
  getGeoidHeight,
  getCurrentLocationAsync,
  // viewer events
  viewerEventsOn,
  viewerEventsOff,
  // camera
  getCameraPosition,
  getCameraFov,
  getCameraAspectRatio,
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
  // spatialId
  spatialIdPickSpace,
  spatialIdExitPickSpace,
  // spatialId events
  spatialIdEventsOn,
  spatialIdEventsOff,
  // extension
  getExtensionList
}: {
  engineName: GlobalThis["reearth"]["engine"]["name"];
  // viewer
  getViewerProperty: () => GlobalThis["reearth"]["viewer"]["property"];
  overrideViewerProperty: GlobalThis["reearth"]["viewer"]["overrideProperty"];
  getViewport: () => GlobalThis["reearth"]["viewer"]["viewport"];
  captureScreen: GlobalThis["reearth"]["viewer"]["capture"];
  getInteractionMode: () => GlobalThis["reearth"]["viewer"]["interactionMode"];
  getInEditor: () => GlobalThis["reearth"]["viewer"]["env"]["inEditor"];
  getIsBuilt: () => GlobalThis["reearth"]["viewer"]["env"]["isBuilt"];
  // viewer tools
  getLocationFromScreenCoordinate: GlobalThis["reearth"]["viewer"]["tools"]["getLocationFromScreenCoordinate"];
  getScreenCoordinateFromPosition: GlobalThis["reearth"]["viewer"]["tools"]["getScreenCoordinateFromPosition"];
  getTerrainHeightAsync: GlobalThis["reearth"]["viewer"]["tools"]["getTerrainHeightAsync"];
  getGlobeHeight: GlobalThis["reearth"]["viewer"]["tools"]["getGlobeHeight"];
  getGlobeHeightByCamera: GlobalThis["reearth"]["viewer"]["tools"]["getGlobeHeightByCamera"];
  cartographicToCartesian: GlobalThis["reearth"]["viewer"]["tools"]["cartographicToCartesian"];
  cartesianToCartographic: GlobalThis["reearth"]["viewer"]["tools"]["cartesianToCartographic"];
  transformByOffsetOnScreen: GlobalThis["reearth"]["viewer"]["tools"]["transformByOffsetOnScreen"];
  isPositionVisibleOnGlobe: GlobalThis["reearth"]["viewer"]["tools"]["isPositionVisibleOnGlobe"];
  getGeoidHeight: GlobalThis["reearth"]["viewer"]["tools"]["getGeoidHeight"];
  getCurrentLocationAsync: GlobalThis["reearth"]["viewer"]["tools"]["getCurrentLocationAsync"];
  // viewer events
  viewerEventsOn: GlobalThis["reearth"]["viewer"]["on"];
  viewerEventsOff: GlobalThis["reearth"]["viewer"]["off"];
  // camera
  getCameraPosition: () => GlobalThis["reearth"]["camera"]["position"];
  getCameraFov: () => GlobalThis["reearth"]["camera"]["fov"];
  getCameraAspectRatio: () => GlobalThis["reearth"]["camera"]["aspectRatio"];
  getCameraViewport: () => GlobalThis["reearth"]["camera"]["viewport"];
  zoomIn: GlobalThis["reearth"]["camera"]["zoomIn"];
  zoomOut: GlobalThis["reearth"]["camera"]["zoomOut"];
  setView: GlobalThis["reearth"]["camera"]["setView"];
  flyTo: GlobalThis["reearth"]["camera"]["flyTo"];
  flyToBoundingBox: GlobalThis["reearth"]["camera"]["flyToBoundingBox"];
  getGlobeIntersection: GlobalThis["reearth"]["camera"]["getGlobeIntersection"];
  enableScreenSpaceCameraController: GlobalThis["reearth"]["camera"]["enableScreenSpaceCameraController"];
  overrideScreenSpaceCameraController: GlobalThis["reearth"]["camera"]["overrideScreenSpaceCameraController"];
  lookAt: GlobalThis["reearth"]["camera"]["lookAt"];
  rotateAround: GlobalThis["reearth"]["camera"]["rotateAround"];
  rotateRight: GlobalThis["reearth"]["camera"]["rotateRight"];
  orbit: GlobalThis["reearth"]["camera"]["orbit"];
  move: GlobalThis["reearth"]["camera"]["move"];
  moveOverTerrain: GlobalThis["reearth"]["camera"]["moveOverTerrain"];
  enableForceHorizontalRoll: GlobalThis["reearth"]["camera"]["enableForceHorizontalRoll"];
  // camera events
  cameraEventsOn: GlobalThis["reearth"]["camera"]["on"];
  cameraEventsOff: GlobalThis["reearth"]["camera"]["off"];
  // timeline
  getTimeline: () => GlobalThis["reearth"]["timeline"];
  // layers
  getLayers: () => MapRef["layers"] | undefined;
  hideLayer: GlobalThis["reearth"]["layers"]["hide"];
  showLayer: GlobalThis["reearth"]["layers"]["show"];
  addLayer: GlobalThis["reearth"]["layers"]["add"];
  findFeatureById: GlobalThis["reearth"]["layers"]["findFeatureById"];
  findFeaturesByIds: GlobalThis["reearth"]["layers"]["findFeaturesByIds"];
  selectLayer: GlobalThis["reearth"]["layers"]["select"];
  selectFeature: GlobalThis["reearth"]["layers"]["selectFeature"];
  selectFeatures: GlobalThis["reearth"]["layers"]["selectFeatures"];
  getSelectedLayer: () => GlobalThis["reearth"]["layers"]["selected"];
  getSelectedFeature: () => GlobalThis["reearth"]["layers"]["selectedFeature"];
  getFeaturesInScreenRect: GlobalThis["reearth"]["layers"]["getFeaturesInScreenRect"];
  bringToFront: GlobalThis["reearth"]["layers"]["bringToFront"];
  sendToBack: GlobalThis["reearth"]["layers"]["sendToBack"];
  // layers events
  layersEventsOn: GlobalThis["reearth"]["layers"]["on"];
  layersEventsOff: GlobalThis["reearth"]["layers"]["off"];
  // sketch
  getSketchTool: () => GlobalThis["reearth"]["sketch"]["tool"];
  setSketchTool: GlobalThis["reearth"]["sketch"]["setTool"];
  getSketchOptions: () => GlobalThis["reearth"]["sketch"]["options"];
  overrideSketchOptions: GlobalThis["reearth"]["sketch"]["overrideOptions"];
  // sketch events
  sketchEventsOn: GlobalThis["reearth"]["sketch"]["on"];
  sketchEventsOff: GlobalThis["reearth"]["sketch"]["off"];
  // spatialId
  spatialIdPickSpace: GlobalThis["reearth"]["spatialId"]["pickSpace"];
  spatialIdExitPickSpace: GlobalThis["reearth"]["spatialId"]["exitPickSpace"];
  // spatialId events
  spatialIdEventsOn: GlobalThis["reearth"]["spatialId"]["on"];
  spatialIdEventsOff: GlobalThis["reearth"]["spatialId"]["off"];
  // extension
  getExtensionList: () => GlobalThis["reearth"]["extension"]["list"];
}): CommonReearth {
  return {
    version: __APP_VERSION__ || "",
    apiVersion: REEATH_PLUGIN_API_VERSION,
    engine: {
      get name() {
        return engineName;
      }
    },
    viewer: {
      get property() {
        return getViewerProperty();
      },
      overrideProperty: overrideViewerProperty,
      get viewport() {
        return getViewport();
      },
      get interactionMode() {
        return getInteractionMode();
      },
      env: {
        get inEditor() {
          return !!getInEditor();
        },
        get isBuilt() {
          return !!getIsBuilt();
        }
      },
      capture: captureScreen,
      open: openUrlInNewTab,
      tools: {
        getLocationFromScreenCoordinate,
        getScreenCoordinateFromPosition,
        getTerrainHeightAsync,
        getGlobeHeight,
        getGlobeHeightByCamera,
        cartographicToCartesian,
        cartesianToCartographic,
        transformByOffsetOnScreen,
        isPositionVisibleOnGlobe,
        getGeoidHeight,
        getCurrentLocationAsync
      },
      on: viewerEventsOn,
      off: viewerEventsOff
    },
    camera: {
      get position() {
        return getCameraPosition();
      },
      get fov() {
        return getCameraFov();
      },
      get aspectRatio() {
        return getCameraAspectRatio();
      },
      get viewport() {
        return getCameraViewport();
      },
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
      on: cameraEventsOn,
      off: cameraEventsOff
    },
    get timeline() {
      return getTimeline();
    },
    layers: {
      get layers() {
        return getLayers()?.layers() ?? [];
      },
      get hide() {
        return hideLayer;
      },
      get show() {
        return showLayer;
      },
      get add() {
        return addLayer;
      },
      get delete() {
        return getLayers()?.deleteLayer;
      },
      get override() {
        return getLayers()?.override;
      },
      get overridden() {
        return getLayers()?.overriddenLayers?.();
      },
      get find() {
        return (
          cb: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean
        ) => getLayers()?.find(cb);
      },
      get findAll() {
        return (
          cb: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean
        ) => getLayers()?.findAll(cb);
      },
      get findById() {
        return (id: string) => getLayers()?.findById(id);
      },
      get findByIds() {
        return (...args: string[]) =>
          getLayers()
            ?.findByIds(...args)
            ?.filter((l): l is LazyLayer => !!l);
      },
      get findFeatureById() {
        return findFeatureById;
      },
      get findFeaturesByIds() {
        return findFeaturesByIds;
      },
      get select() {
        return selectLayer;
      },
      get selectFeature() {
        return selectFeature;
      },
      get selectFeatures() {
        return selectFeatures;
      },
      get selected() {
        return getSelectedLayer();
      },
      get selectedFeature() {
        return getSelectedFeature();
      },
      get getFeaturesInScreenRect() {
        return getFeaturesInScreenRect;
      },
      get bringToFront() {
        return bringToFront;
      },
      get sendToBack() {
        return sendToBack;
      },
      on: layersEventsOn,
      off: layersEventsOff
    },
    sketch: {
      get tool() {
        return getSketchTool();
      },
      get setTool() {
        return setSketchTool;
      },
      get options() {
        return getSketchOptions();
      },
      get overrideOptions() {
        return overrideSketchOptions;
      },
      on: sketchEventsOn,
      off: sketchEventsOff
    },
    spatialId: {
      get pickSpace() {
        return spatialIdPickSpace;
      },
      get exitPickSpace() {
        return spatialIdExitPickSpace;
      },
      on: spatialIdEventsOn,
      off: spatialIdEventsOff
    },
    extension: {
      get list() {
        return getExtensionList();
      }
    }
  };
}
