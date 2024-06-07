import { merge } from "@reearth/beta/utils/object";
import type {
  Tag,
  Events,
  Layer,
  LayersRef,
  NaiveLayer,
  LazyLayer,
  TimelineManagerRef,
  ViewerProperty,
} from "@reearth/core";

import type { InfoboxBlock as Block } from "../Infobox/types";
import type { MapRef } from "../types";
import type { Widget, WidgetLocationOptions } from "../Widgets";

import type { GlobalThis, ReearthEventType, Reearth, Plugin, PopupPosition } from "./plugin_types";
import type { ClientStorage } from "./useClientStorage";
import type { PluginInstances } from "./usePluginInstances";

export type CommonReearth = Omit<
  Reearth,
  | "plugin"
  | "ui"
  | "modal"
  | "popup"
  | "block"
  | "layer"
  | "widget"
  | "clientStorage"
  | "interactionMode"
>;

export function exposed({
  render,
  closeUI,
  postMessage,
  resize,
  renderModal,
  closeModal,
  updateModal,
  postMessageModal,
  renderPopup,
  closePopup,
  updatePopup,
  postMessagePopup,
  events,
  commonReearth,
  plugin,
  layer,
  block,
  widget,
  startEventLoop,
  overrideViewerProperty,
  moveWidget,
  pluginPostMessage,
  clientStorage,
  timelineManagerRef,
}: {
  render: (
    html: string,
    options?: {
      visible?: boolean;
      width?: string | number;
      height?: string | number;
      extended?: boolean;
    },
  ) => void;
  closeUI: Reearth["ui"]["close"];
  postMessage: Reearth["ui"]["postMessage"];
  resize: Reearth["ui"]["resize"];
  renderModal: (
    html: string,
    options?: {
      width?: string | number;
      height?: string | number;
      background?: string;
    },
  ) => void;
  closeModal: Reearth["modal"]["close"];
  updateModal: Reearth["modal"]["update"];
  postMessageModal: Reearth["modal"]["postMessage"];
  renderPopup: Reearth["popup"]["show"];
  closePopup: Reearth["popup"]["close"];
  updatePopup: Reearth["popup"]["update"];
  postMessagePopup: Reearth["popup"]["postMessage"];
  events: Events<ReearthEventType>;
  commonReearth: CommonReearth;
  plugin?: Plugin;
  layer?: () => Layer | undefined;
  block?: () => Block | undefined;
  widget?: () => Widget | undefined;
  startEventLoop?: () => void;
  overrideViewerProperty?: (pluginId: string, property: ViewerProperty) => void;
  moveWidget?: (widgetId: string, options: WidgetLocationOptions) => void;
  pluginPostMessage: (extentionId: string, msg: any, sender: string) => void;
  clientStorage: ClientStorage;
  timelineManagerRef?: TimelineManagerRef;
}): GlobalThis {
  return merge({
    console: {
      error: console.error,
      log: console.log,
    },
    reearth: merge(
      commonReearth,
      {
        visualizer: merge(commonReearth.visualizer, {
          get overrideProperty() {
            return (property: any) => {
              overrideViewerProperty?.(
                plugin ? `${plugin.id}/${plugin.extensionId}` : "",
                property,
              );
            };
          },
        }),
        layers: merge(commonReearth.layers, {
          get add() {
            return (layer: NaiveLayer) => commonReearth.layers?.add?.(layer);
          },
        }),
        ui: {
          show: (
            html: string,
            options?:
              | {
                  visible?: boolean | undefined;
                }
              | undefined,
          ) => {
            render(html, options);
          },
          postMessage,
          resize,
          close: closeUI,
        },
        modal: {
          show: (
            html: string,
            options?: {
              width?: number | string;
              height?: number | string;
              background?: string;
            },
          ) => {
            renderModal(html, options);
          },
          postMessage: postMessageModal,
          update: updateModal,
          close: closeModal,
        },
        popup: {
          show: (
            html: string,
            options?: {
              width?: number | string;
              height?: number | string;
              position?: PopupPosition;
              offset?: number;
            },
          ) => {
            renderPopup(html, options);
          },
          postMessage: postMessagePopup,
          update: updatePopup,
          close: closePopup,
        },
        scene: merge(commonReearth.scene, {
          get overrideProperty() {
            return (property: any) => {
              overrideViewerProperty?.(
                plugin ? `${plugin.id}/${plugin.extensionId}` : "",
                property,
              );
            };
          },
          get sampleTerrainHeight() {
            return async (lng: number, lat: number) => {
              const result = await commonReearth?.scene?.sampleTerrainHeight?.(lng, lat);
              startEventLoop?.();
              return result;
            };
          },
        }),
        clock: merge(commonReearth.clock, {
          get play() {
            return () => {
              timelineManagerRef?.current?.commit({
                cmd: "PLAY",
                committer: {
                  source: "pluginAPI",
                  id:
                    (plugin?.extensionType === "widget"
                      ? widget?.()?.id
                      : plugin?.extensionType === "block"
                      ? block?.()?.id
                      : "") ?? "",
                },
              });
            };
          },
          get pause() {
            return () =>
              timelineManagerRef?.current?.commit({
                cmd: "PAUSE",
                committer: {
                  source: "pluginAPI",
                  id:
                    (plugin?.extensionType === "widget"
                      ? widget?.()?.id
                      : plugin?.extensionType === "block"
                      ? block?.()?.id
                      : "") ?? "",
                },
              });
          },
          get setTime() {
            return (time: { start: Date | string; stop: Date | string; current: Date | string }) =>
              timelineManagerRef?.current?.commit({
                cmd: "SET_TIME",
                payload: { ...time },
                committer: {
                  source: "pluginAPI",
                  id:
                    (plugin?.extensionType === "widget"
                      ? widget?.()?.id
                      : plugin?.extensionType === "block"
                      ? block?.()?.id
                      : "") ?? "",
                },
              });
          },
          get setSpeed() {
            return (speed: number) =>
              timelineManagerRef?.current?.commit({
                cmd: "SET_OPTIONS",
                payload: { multiplier: speed },
                committer: {
                  source: "pluginAPI",
                  id:
                    (plugin?.extensionType === "widget"
                      ? widget?.()?.id
                      : plugin?.extensionType === "block"
                      ? block?.()?.id
                      : "") ?? "",
                },
              });
          },
          get setStepType() {
            return (stepType: "fixed" | "rate") =>
              timelineManagerRef?.current?.commit({
                cmd: "SET_OPTIONS",
                payload: { stepType },
                committer: {
                  source: "pluginAPI",
                  id:
                    (plugin?.extensionType === "widget"
                      ? widget?.()?.id
                      : plugin?.extensionType === "block"
                      ? block?.()?.id
                      : "") ?? "",
                },
              });
          },
          get setRangeType() {
            return (rangeType: "unbounded" | "clamped" | "bounced") =>
              timelineManagerRef?.current?.commit({
                cmd: "SET_OPTIONS",
                payload: { rangeType },
                committer: {
                  source: "pluginAPI",
                  id:
                    (plugin?.extensionType === "widget"
                      ? widget?.()?.id
                      : plugin?.extensionType === "block"
                      ? block?.()?.id
                      : "") ?? "",
                },
              });
          },
        }),
        plugin: {
          get id() {
            return plugin?.id;
          },
          get extensionType() {
            return plugin?.extensionType;
          },
          get extensionId() {
            return plugin?.extensionId;
          },
          get property() {
            return plugin?.property;
          },
        },
        plugins: {
          get postMessage() {
            const sender =
              (plugin?.extensionType === "widget"
                ? widget?.()?.id
                : plugin?.extensionType === "block"
                ? block?.()?.id
                : "") ?? "";
            return (id: string, msg: any) => pluginPostMessage(id, msg, sender);
          },
          get instances() {
            return commonReearth.plugins.instances;
          },
        },
        clientStorage: {
          get getAsync() {
            return (key: string) => {
              const promise = clientStorage.getAsync(
                (plugin?.extensionType === "widget"
                  ? widget?.()?.id
                  : plugin?.extensionType === "block"
                  ? block?.()?.id
                  : "") ?? "",
                key,
              );
              promise.finally(() => {
                startEventLoop?.();
              });
              return promise;
            };
          },
          get setAsync() {
            return (key: string, value: any) => {
              const localValue =
                typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
              const promise = clientStorage.setAsync(
                (plugin?.extensionType === "widget"
                  ? widget?.()?.id
                  : plugin?.extensionType === "block"
                  ? block?.()?.id
                  : "") ?? "",
                key,
                localValue,
              );
              promise.finally(() => {
                startEventLoop?.();
              });
              return promise;
            };
          },
          get deleteAsync() {
            return (key: string) => {
              const promise = clientStorage.deleteAsync(
                (plugin?.extensionType === "widget"
                  ? widget?.()?.id
                  : plugin?.extensionType === "block"
                  ? block?.()?.id
                  : "") ?? "",
                key,
              );
              promise.finally(() => {
                startEventLoop?.();
              });
              return promise;
            };
          },
          get keysAsync() {
            return () => {
              const promise = clientStorage.keysAsync(
                (plugin?.extensionType === "widget"
                  ? widget?.()?.id
                  : plugin?.extensionType === "block"
                  ? block?.()?.id
                  : "") ?? "",
              );
              promise.finally(() => {
                startEventLoop?.();
              });
              return promise;
            };
          },
        },
        ...events,
      },
      plugin?.extensionType === "block"
        ? {
            get layer() {
              return layer?.();
            },
            get block() {
              return block?.();
            },
          }
        : {},
      plugin?.extensionType === "widget"
        ? {
            get widget() {
              return {
                ...widget?.(),
                moveTo: (options: WidgetLocationOptions) => {
                  const widgetId = widget?.()?.id;
                  if (!widgetId) return;
                  moveWidget?.(widgetId, options);
                },
              };
            },
          }
        : {},
    ),
  });
}

export function commonReearth({
  engineName,
  events,
  layersInViewport,
  layers,
  viewerProperty,
  inEditor,
  built,
  tags,
  camera,
  clock,
  sketch,
  interactionMode,
  pluginInstances,
  viewport,
  selectedLayer,
  selectedFeature,
  layerSelectionReason,
  selectLayer,
  selectFeature,
  selectFeatures,
  showLayer,
  hideLayer,
  addLayer,
  overrideLayerProperty,
  overrideViewerProperty,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
  cameraViewport,
  getCameraFovInfo,
  orbit,
  rotateRight,
  captureScreen,
  getLocationFromScreen,
  sampleTerrainHeight,
  computeGlobeHeight,
  getGlobeHeight,
  toXYZ,
  toLngLatHeight,
  convertScreenToPositionOffset,
  isPositionVisible,
  setView,
  toWindowPosition,
  flyToBBox,
  rotateOnCenter,
  enableScreenSpaceCameraController,
  overrideScreenSpaceController,
  lookHorizontal,
  lookVertical,
  moveForward,
  moveBackward,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  moveOverTerrain,
  flyToGround,
  findFeatureById,
  findFeaturesByIds,
  pickManyFromViewport,
  bringToFront,
  sendToBack,
  forceHorizontalRoll,
}: {
  engineName?: string;
  events: Events<ReearthEventType>;
  layers: () => MapRef["layers"] | undefined;
  viewerProperty: () => GlobalThis["reearth"]["viewer"]["property"];
  tags: () => Tag[];
  viewport: () => GlobalThis["reearth"]["viewport"];
  camera: () => GlobalThis["reearth"]["camera"]["position"];
  clock: () => GlobalThis["reearth"]["clock"];
  sketch: () => GlobalThis["reearth"]["sketch"];
  interactionMode: () => GlobalThis["reearth"]["interactionMode"];
  pluginInstances: () => PluginInstances;
  selectedLayer: () => GlobalThis["reearth"]["layers"]["selected"];
  selectedFeature: () => GlobalThis["reearth"]["layers"]["selectedFeature"];
  layerSelectionReason: () => GlobalThis["reearth"]["layers"]["selectionReason"];
  selectLayer: LayersRef["select"];
  selectFeature: LayersRef["selectFeature"];
  selectFeatures: LayersRef["selectFeatures"];
  layersInViewport: GlobalThis["reearth"]["layers"]["layersInViewport"];
  showLayer: GlobalThis["reearth"]["layers"]["show"];
  hideLayer: GlobalThis["reearth"]["layers"]["hide"];
  addLayer: GlobalThis["reearth"]["layers"]["add"];
  overrideLayerProperty: GlobalThis["reearth"]["layers"]["overrideProperty"];
  overrideViewerProperty: GlobalThis["reearth"]["viewer"]["overrideProperty"];
  flyTo: GlobalThis["reearth"]["camera"]["flyTo"];
  lookAt: GlobalThis["reearth"]["camera"]["lookAt"];
  zoomIn: GlobalThis["reearth"]["camera"]["zoomIn"];
  zoomOut: GlobalThis["reearth"]["camera"]["zoomOut"];
  rotateRight: GlobalThis["reearth"]["camera"]["rotateRight"];
  orbit: GlobalThis["reearth"]["camera"]["orbit"];
  cameraViewport?: () => GlobalThis["reearth"]["camera"]["viewport"];
  getCameraFovInfo: GlobalThis["reearth"]["camera"]["getFovInfo"];
  captureScreen: GlobalThis["reearth"]["scene"]["captureScreen"];
  getLocationFromScreen: GlobalThis["reearth"]["scene"]["getLocationFromScreen"];
  sampleTerrainHeight: GlobalThis["reearth"]["scene"]["sampleTerrainHeight"];
  computeGlobeHeight: GlobalThis["reearth"]["scene"]["computeGlobeHeight"];
  getGlobeHeight: GlobalThis["reearth"]["scene"]["getGlobeHeight"];
  toXYZ: GlobalThis["reearth"]["scene"]["toXYZ"];
  toLngLatHeight: GlobalThis["reearth"]["scene"]["toLngLatHeight"];
  convertScreenToPositionOffset: GlobalThis["reearth"]["scene"]["convertScreenToPositionOffset"];
  isPositionVisible: GlobalThis["reearth"]["scene"]["isPositionVisible"];
  setView: GlobalThis["reearth"]["camera"]["setView"];
  toWindowPosition: GlobalThis["reearth"]["scene"]["toWindowPosition"];
  flyToBBox: GlobalThis["reearth"]["camera"]["flyToBBox"];
  rotateOnCenter: GlobalThis["reearth"]["camera"]["rotateOnCenter"];
  overrideScreenSpaceController: GlobalThis["reearth"]["camera"]["overrideScreenSpaceController"];
  forceHorizontalRoll: GlobalThis["reearth"]["camera"]["forceHorizontalRoll"];
  inEditor: () => GlobalThis["reearth"]["scene"]["inEditor"];
  built: () => GlobalThis["reearth"]["scene"]["built"];
  enableScreenSpaceCameraController: GlobalThis["reearth"]["camera"]["enableScreenSpaceController"];
  lookHorizontal: GlobalThis["reearth"]["camera"]["lookHorizontal"];
  lookVertical: GlobalThis["reearth"]["camera"]["lookVertical"];
  moveForward: GlobalThis["reearth"]["camera"]["moveForward"];
  moveBackward: GlobalThis["reearth"]["camera"]["moveBackward"];
  moveUp: GlobalThis["reearth"]["camera"]["moveUp"];
  moveDown: GlobalThis["reearth"]["camera"]["moveDown"];
  moveLeft: GlobalThis["reearth"]["camera"]["moveLeft"];
  moveRight: GlobalThis["reearth"]["camera"]["moveRight"];
  moveOverTerrain: GlobalThis["reearth"]["camera"]["moveOverTerrain"];
  flyToGround: GlobalThis["reearth"]["camera"]["flyToGround"];
  findFeatureById: GlobalThis["reearth"]["layers"]["findFeatureById"];
  findFeaturesByIds: GlobalThis["reearth"]["layers"]["findFeaturesByIds"];
  bringToFront: GlobalThis["reearth"]["layers"]["bringToFront"];
  sendToBack: GlobalThis["reearth"]["layers"]["sendToBack"];
  pickManyFromViewport: GlobalThis["reearth"]["scene"]["pickManyFromViewport"];
}): CommonReearth {
  return {
    version: window.REEARTH_CONFIG?.version || "",
    apiVersion: 1.1,
    visualizer: {
      engine: engineName,
      camera: {
        flyTo,
        lookAt,
        zoomIn,
        zoomOut,
        rotateRight,
        orbit,
        get position() {
          return camera?.();
        },
        get viewport() {
          return cameraViewport?.();
        },
        getFovInfo: getCameraFovInfo,
        enableScreenSpaceController: enableScreenSpaceCameraController,
        lookHorizontal,
        lookVertical,
        moveForward,
        moveBackward,
        moveUp,
        moveDown,
        moveLeft,
        moveRight,
        moveOverTerrain,
        flyToGround,
        setView,
        flyToBBox,
        rotateOnCenter,
        overrideScreenSpaceController,
        forceHorizontalRoll,
      },
      get property() {
        return viewerProperty?.();
      },
      overrideProperty: overrideViewerProperty,
    },
    get clock() {
      return clock?.();
    },
    get interactionMode() {
      return interactionMode?.();
    },
    scene: {
      get inEditor() {
        return !!inEditor?.();
      },
      get built() {
        return !!built?.();
      },
      captureScreen,
      getLocationFromScreen,
      sampleTerrainHeight,
      computeGlobeHeight,
      getGlobeHeight,
      toXYZ,
      toLngLatHeight,
      convertScreenToPositionOffset,
      isPositionVisible,
      toWindowPosition,
      pickManyFromViewport,
    },
    viewer: {
      get property() {
        return viewerProperty?.();
      },
      overrideProperty: overrideViewerProperty,
    },
    get viewport() {
      return viewport?.();
    },
    engineName,
    camera: {
      flyTo,
      lookAt,
      zoomIn,
      zoomOut,
      rotateRight,
      orbit,
      get position() {
        return camera();
      },
      get viewport() {
        return cameraViewport?.();
      },
      getFovInfo: getCameraFovInfo,
      enableScreenSpaceController: enableScreenSpaceCameraController,
      lookHorizontal,
      lookVertical,
      moveForward,
      moveBackward,
      moveUp,
      moveDown,
      moveLeft,
      moveRight,
      moveOverTerrain,
      flyToGround,
      setView,
      flyToBBox,
      rotateOnCenter,
      overrideScreenSpaceController,
      forceHorizontalRoll,
    },
    layers: {
      get layersInViewport() {
        return layersInViewport;
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
      get show() {
        return showLayer;
      },
      get hide() {
        return hideLayer;
      },
      // For compat
      get overriddenProperties() {
        return layers()
          ?.overriddenLayers?.()
          ?.reduce((res, v) => {
            return {
              ...res,
              [v.id]: v.compat?.property,
            };
          }, {} as { [id: string]: any });
      },
      get overrideProperty() {
        return overrideLayerProperty;
      },
      get isLayer() {
        return !!layers()?.isLayer;
      },
      get layers() {
        return layers()?.layers() ?? [];
      },
      get tags() {
        return tags();
      },
      get selectionReason() {
        return layerSelectionReason();
      },
      get overriddenInfobox() {
        return layerSelectionReason()?.defaultInfobox;
      },
      get defaultInfobox() {
        return layerSelectionReason()?.defaultInfobox;
      },
      get selected() {
        return selectedLayer();
      },
      get selectedFeature() {
        return selectedFeature();
      },
      get findById() {
        return (id: string) => layers()?.findById(id);
      },
      get findByIds() {
        return (...args: string[]) =>
          layers()
            ?.findByIds(...args)
            ?.filter((l): l is LazyLayer => !!l);
      },
      get findByTags() {
        return (...args: string[]) => layers()?.findByTags(...args);
      },
      get findByTagLabels() {
        return (...args: string[]) => layers()?.findByTagLabels(...args);
      },
      get find() {
        return (cb: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean) =>
          layers()?.find(cb);
      },
      get findAll() {
        return (cb: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean) =>
          layers()?.findAll(cb);
      },
      get override() {
        return layers()?.override;
      },
      get overridden() {
        return layers()?.overriddenLayers?.();
      },
      get replace() {
        return layers()?.replace;
      },
      get delete() {
        return layers()?.deleteLayer;
      },
      get walk() {
        return layers()?.walk;
      },
      get add() {
        return addLayer;
      },
      findFeatureById,
      findFeaturesByIds,
      bringToFront,
      sendToBack,
    },
    plugins: {
      get instances() {
        return pluginInstances().meta.current;
      },
    },
    get sketch() {
      return sketch?.();
    },
    ...events,
  };
}
