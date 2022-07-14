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
} from "./types";

export type CommonReearth = Omit<Reearth, "plugin" | "ui" | "block" | "layer" | "widget">;

export function exposed({
  render,
  postMessage,
  resize,
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
            return (layer: Layer, parentId?: string) => {
              commonReearth.layers.add(
                layer,
                parentId,
                plugin ? `${plugin.id}/${plugin.extensionId}` : "",
              );
            };
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
}: {
  engineName: string;
  events: Events<ReearthEventType>;
  layers: () => LayerStore;
  sceneProperty: () => any;
  tags: () => Tag[];
  camera: () => GlobalThis["reearth"]["visualizer"]["camera"]["position"];
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
  viewport: () => GlobalThis["reearth"]["visualizer"]["camera"]["viewport"];
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
        get position() {
          return camera();
        },
        get viewport() {
          return viewport();
        },
      },
      get property() {
        return sceneProperty();
      },
      overrideProperty: overrideSceneProperty,
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
