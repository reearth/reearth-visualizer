import type { Events } from "@reearth/util/event";
import { merge } from "@reearth/util/object";

import type { LayerStore } from "../Layers";

import type { GlobalThis, Block, Layer, Widget, ReearthEventType, Reearth, Plugin } from "./types";

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
  camera,
  selectedLayer,
  layerSelectionReason,
  layerOverriddenInfobox,
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
  camera: () => GlobalThis["reearth"]["visualizer"]["camera"]["position"];
  selectedLayer: () => GlobalThis["reearth"]["layers"]["selected"];
  layerSelectionReason: () => GlobalThis["reearth"]["layers"]["selectionReason"];
  layerOverriddenInfobox: () => GlobalThis["reearth"]["layers"]["overriddenInfobox"];
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
      select: selectLayer,
      show: showLayer,
      hide: hideLayer,
      overrideProperty: overrideLayerProperty,
      get layers() {
        return layers().root.children ?? [];
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
    },
    ...events,
  };
}
