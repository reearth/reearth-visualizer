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
  events,
  // engineAPI,
  commonReearth,
  plugin,
  layer,
  block,
  widget,
}: {
  render: (html: string, options?: { visible?: boolean }) => void;
  postMessage: (message: any) => void;
  events: Events<ReearthEventType>;
  engineAPI: any;
  commonReearth: CommonReearth;
  plugin?: Plugin;
  layer?: () => Layer | undefined;
  block?: () => Block | undefined;
  widget?: () => Widget | undefined;
}): GlobalThis {
  return merge(
    {
      console: {
        error: console.error,
        log: console.log,
      },
      reearth: merge(
        commonReearth,
        {
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
        plugin?.extensionType === "primitive"
          ? {
              get layer() {
                return layer?.();
              },
            }
          : {},
        plugin?.extensionType === "block"
          ? {
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
    },
    // plugin?.extensionType === "primitive" || plugin?.extensionType === "widget"
    //   ? engineAPI ?? {}
    //   : {},
  );
}

export function commonReearth({
  engineName,
  events,
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
  overrideLayerProperty,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
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
  showLayer: GlobalThis["reearth"]["layers"]["show"];
  hideLayer: GlobalThis["reearth"]["layers"]["hide"];
  overrideLayerProperty: GlobalThis["reearth"]["layers"]["overrideProperty"];
  flyTo: GlobalThis["reearth"]["visualizer"]["camera"]["flyTo"];
  lookAt: GlobalThis["reearth"]["visualizer"]["camera"]["lookAt"];
  zoomIn: GlobalThis["reearth"]["visualizer"]["camera"]["zoomIn"];
  zoomOut: GlobalThis["reearth"]["visualizer"]["camera"]["zoomOut"];
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
      },
      get property() {
        return sceneProperty();
      },
    },
    layers: {
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
    },
    ...events,
  };
}
