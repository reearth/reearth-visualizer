import type { Tag } from "@reearth/core/mantle/compat";
import type { Events, Layer, NaiveLayer } from "@reearth/core/Map";
import { merge } from "@reearth/util/object";

import type { Block } from "../Infobox";
import type { MapRef } from "../types";
import type { Widget, WidgetLocationOptions } from "../Widgets";

import type { GlobalThis, ReearthEventType, Reearth, Plugin, PopupPosition } from "./plugin_types";
import type { ClientStorage } from "./useClientStorage";
import type { PluginInstances } from "./usePluginInstances";

export type CommonReearth = Omit<
  Reearth,
  "plugin" | "ui" | "modal" | "popup" | "block" | "layer" | "widget" | "clientStorage"
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
  overrideSceneProperty,
  moveWidget,
  pluginPostMessage,
  clientStorage,
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
  overrideSceneProperty?: (pluginId: string, property: any) => void;
  moveWidget?: (widgetId: string, options: WidgetLocationOptions) => void;
  pluginPostMessage: (extentionId: string, msg: any, sender: string) => void;
  clientStorage: ClientStorage;
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
              overrideSceneProperty?.(plugin ? `${plugin.id}/${plugin.extensionId}` : "", property);
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
            options?:
              | {
                  background?: string;
                }
              | undefined,
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
            options:
              | {
                  position?: PopupPosition;
                  offset?: number;
                }
              | undefined,
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
              overrideSceneProperty?.(plugin ? `${plugin.id}/${plugin.extensionId}` : "", property);
            };
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
  sceneProperty,
  inEditor,
  tags,
  camera,
  clock,
  pluginInstances,
  viewport,
  selectedLayer,
  layerSelectionReason,
  layerOverriddenProperties,
  selectLayer,
  showLayer,
  hideLayer,
  addLayer,
  overrideLayerProperty,
  overrideSceneProperty,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
  cameraViewport,
  orbit,
  rotateRight,
  captureScreen,
  getLocationFromScreen,
  enableScreenSpaceCameraController,
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
}: {
  engineName?: string;
  events: Events<ReearthEventType>;
  layers: () => MapRef["layers"] | undefined;
  sceneProperty: () => any;
  tags: () => Tag[];
  viewport: () => GlobalThis["reearth"]["viewport"];
  camera: () => GlobalThis["reearth"]["camera"]["position"];
  clock: () => GlobalThis["reearth"]["clock"];
  pluginInstances: () => PluginInstances;
  selectedLayer: () => GlobalThis["reearth"]["layers"]["selected"];
  layerSelectionReason: () => GlobalThis["reearth"]["layers"]["selectionReason"];
  layerOverriddenProperties?: () => GlobalThis["reearth"]["layers"]["overriddenProperties"];
  selectLayer: GlobalThis["reearth"]["layers"]["select"];
  layersInViewport: GlobalThis["reearth"]["layers"]["layersInViewport"];
  showLayer: GlobalThis["reearth"]["layers"]["show"];
  hideLayer: GlobalThis["reearth"]["layers"]["hide"];
  addLayer: GlobalThis["reearth"]["layers"]["add"];
  overrideLayerProperty: GlobalThis["reearth"]["layers"]["overrideProperty"];
  overrideSceneProperty: GlobalThis["reearth"]["scene"]["overrideProperty"];
  flyTo: GlobalThis["reearth"]["camera"]["flyTo"];
  lookAt: GlobalThis["reearth"]["camera"]["lookAt"];
  zoomIn: GlobalThis["reearth"]["camera"]["zoomIn"];
  zoomOut: GlobalThis["reearth"]["camera"]["zoomOut"];
  rotateRight: GlobalThis["reearth"]["camera"]["rotateRight"];
  orbit: GlobalThis["reearth"]["camera"]["orbit"];
  cameraViewport?: () => GlobalThis["reearth"]["camera"]["viewport"];
  captureScreen: GlobalThis["reearth"]["scene"]["captureScreen"];
  getLocationFromScreen: GlobalThis["reearth"]["scene"]["getLocationFromScreen"];
  inEditor: () => GlobalThis["reearth"]["scene"]["inEditor"];
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
}): CommonReearth {
  return {
    version: window.REEARTH_CONFIG?.version || "",
    apiVersion: 1,
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
      },
      get property() {
        return sceneProperty?.();
      },
      overrideProperty: overrideSceneProperty,
    },
    get clock() {
      return clock?.();
    },
    scene: {
      get inEditor() {
        return !!inEditor?.();
      },
      get property() {
        return sceneProperty?.();
      },
      overrideProperty: overrideSceneProperty,
      captureScreen,
      getLocationFromScreen,
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
    },
    layers: {
      get layersInViewport() {
        return layersInViewport;
      },
      get select() {
        return selectLayer;
      },
      get show() {
        return showLayer;
      },
      get hide() {
        return hideLayer;
      },
      get overriddenProperties() {
        return layerOverriddenProperties?.();
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
        return layerSelectionReason()?.overriddenInfobox;
      },
      get selected() {
        return selectedLayer();
      },
      get findById() {
        return layers()?.findById;
      },
      get findByIds() {
        return layers()?.findByIds;
      },
      get findByTags() {
        return layers()?.findByTags;
      },
      get findByTagLabels() {
        return layers()?.findByTagLabels;
      },
      get find() {
        return layers()?.find;
      },
      get findAll() {
        return layers()?.findAll;
      },
      get walk() {
        return layers()?.walk;
      },
      get add() {
        return addLayer;
      },
    },
    plugins: {
      get instances() {
        return pluginInstances().meta.current;
      },
    },
    ...events,
  };
}
