import type { Events } from "@reearth/util/event";
import { merge } from "@reearth/util/object";

import type { LayerStore } from "../Layers";

import type {
  GlobalThis,
  Block,
  Layer,
  Widget,
  ReearthEventType,
  Reearth,
  Plugin,
  Tag,
  PopupPosition,
} from "./types";

export type CommonReearth = Omit<
  Reearth,
  "plugin" | "ui" | "modal" | "popup" | "block" | "layer" | "widget"
>;

export function exposed({
  render,
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
  overrideSceneProperty,
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
  overrideSceneProperty?: (pluginId: string, property: any) => void;
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
            return (layer: Layer, parentId?: string) =>
              commonReearth.layers.add(
                layer,
                parentId,
                plugin ? `${plugin.id}/${plugin.extensionId}` : "",
              );
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
              return widget?.();
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
  tags,
  camera,
  clock,
  selectedLayer,
  layerSelectionReason,
  layerOverriddenInfobox,
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
  viewport,
  orbit,
  rotateRight,
  captureScreen,
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
  engineName: string;
  events: Events<ReearthEventType>;
  layers: () => LayerStore;
  sceneProperty: () => any;
  tags: () => Tag[];
  camera: () => GlobalThis["reearth"]["camera"]["position"];
  clock: () => GlobalThis["reearth"]["clock"];
  selectedLayer: () => GlobalThis["reearth"]["layers"]["selected"];
  layerSelectionReason: () => GlobalThis["reearth"]["layers"]["selectionReason"];
  layerOverriddenInfobox: () => GlobalThis["reearth"]["layers"]["overriddenInfobox"];
  layerOverriddenProperties: () => GlobalThis["reearth"]["layers"]["overriddenProperties"];
  selectLayer: GlobalThis["reearth"]["layers"]["select"];
  layersInViewport: () => GlobalThis["reearth"]["layers"]["layersInViewport"];
  showLayer: GlobalThis["reearth"]["layers"]["show"];
  hideLayer: GlobalThis["reearth"]["layers"]["hide"];
  addLayer: GlobalThis["reearth"]["layers"]["add"];
  overrideLayerProperty: GlobalThis["reearth"]["layers"]["overrideProperty"];
  overrideSceneProperty: GlobalThis["reearth"]["visualizer"]["overrideProperty"];
  flyTo: GlobalThis["reearth"]["visualizer"]["camera"]["flyTo"];
  lookAt: GlobalThis["reearth"]["visualizer"]["camera"]["lookAt"];
  zoomIn: GlobalThis["reearth"]["visualizer"]["camera"]["zoomIn"];
  zoomOut: GlobalThis["reearth"]["visualizer"]["camera"]["zoomOut"];
  rotateRight: GlobalThis["reearth"]["visualizer"]["camera"]["rotateRight"];
  orbit: GlobalThis["reearth"]["visualizer"]["camera"]["orbit"];
  viewport: () => GlobalThis["reearth"]["visualizer"]["camera"]["viewport"];
  captureScreen: GlobalThis["reearth"]["scene"]["captureScreen"];
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
          return camera();
        },
        get viewport() {
          return viewport();
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
        return sceneProperty();
      },
      overrideProperty: overrideSceneProperty,
    },
    get clock() {
      return clock();
    },
    scene: {
      get property() {
        return sceneProperty();
      },
      overrideProperty: overrideSceneProperty,
      captureScreen,
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
        return viewport();
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
        return layersInViewport();
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
        return layerOverriddenProperties();
      },
      get overrideProperty() {
        return overrideLayerProperty;
      },
      get isLayer() {
        return layers().isLayer;
      },
      get layers() {
        return layers().root.children ?? [];
      },
      get tags() {
        return tags();
      },
      get selectionReason() {
        return layerSelectionReason();
      },
      get overriddenInfobox() {
        return layerOverriddenInfobox();
      },
      get selected() {
        return selectedLayer();
      },
      get findById() {
        return layers().findById;
      },
      get findByIds() {
        return layers().findByIds;
      },
      get findByTags() {
        return layers().findByTags;
      },
      get findByTagLabels() {
        return layers().findByTagLabels;
      },
      get find() {
        return layers().find;
      },
      get findAll() {
        return layers().findAll;
      },
      get walk() {
        return layers().walk;
      },
      get add() {
        return addLayer;
      },
    },
    ...events,
  };
}
