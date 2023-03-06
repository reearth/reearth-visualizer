import type { Tag } from "@reearth/core/mantle/compat";
import {
  copyLazyLayer,
  Events,
  Layer,
  LayerSelectionReason,
  LayersRef,
  NaiveLayer,
  LazyLayer,
  copyLazyLayers,
} from "@reearth/core/Map";
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
  selectedFeature,
  layerSelectionReason,
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
  sampleTerrainHeight,
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
  selectedFeature: () => GlobalThis["reearth"]["layers"]["selectedFeature"];
  layerSelectionReason: () => GlobalThis["reearth"]["layers"]["selectionReason"];
  selectLayer: LayersRef["select"];
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
  sampleTerrainHeight: GlobalThis["reearth"]["scene"]["sampleTerrainHeight"];
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
      sampleTerrainHeight,
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
        // For compat
        return (id: string | undefined, reason?: LayerSelectionReason | undefined) =>
          selectLayer?.(id, id, reason);
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
        return copyLazyLayers(layers()?.layers()) ?? [];
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
        return (id: string) => copyLazyLayer(layers()?.findById(id));
      },
      get findByIds() {
        return (...args: string[]) =>
          copyLazyLayers(
            layers()
              ?.findByIds(...args)
              ?.filter((l): l is LazyLayer => !!l),
          );
      },
      get findByTags() {
        return (...args: string[]) => copyLazyLayers(layers()?.findByTags(...args));
      },
      get findByTagLabels() {
        return (...args: string[]) => copyLazyLayers(layers()?.findByTagLabels(...args));
      },
      get find() {
        return (cb: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean) =>
          copyLazyLayer(layers()?.find(cb));
      },
      get findAll() {
        return (cb: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean) =>
          copyLazyLayers(layers()?.findAll(cb));
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
    },
    plugins: {
      get instances() {
        return pluginInstances().meta.current;
      },
    },
    ...events,
  };
}
