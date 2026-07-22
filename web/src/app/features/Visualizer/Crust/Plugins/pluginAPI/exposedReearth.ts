import { ViewerProperty } from "@reearth/app/features/Editor/Visualizer/type";
import { merge } from "@reearth/app/utils/object";
import type { Layer, TimelineManagerRef } from "@reearth/core";

import type { Widget } from "../../Widgets";
import type { ClientStorage } from "../useClientStorage";

import { CommonReearth } from "./commonReearth";
import type { GlobalThis, Reearth } from "./types";

export function exposedReearth({
  commonReearth,
  plugin,
  // viewer events
  viewerEventsOn,
  viewerEventsOff,
  // timeline
  timelineManagerRef,
  // ui
  render,
  closeUI,
  postMessage,
  resize,
  uiEventsOn,
  uiEventsOff,
  // modal
  renderModal,
  closeModal,
  updateModal,
  postMessageModal,
  modalEventsOn,
  modalEventsOff,
  // popup
  renderPopup,
  closePopup,
  updatePopup,
  postMessagePopup,
  popupEventsOn,
  popupEventsOff,
  // extension
  extensionEventsOn,
  extensionEventsOff,
  // viewer
  overrideViewerProperty,
  // extension
  getWidget,
  getBlock,
  getLayer,
  pluginPostMessage,
  // data
  clientStorage
}: {
  commonReearth: CommonReearth;
  // Getter function to access latest plugin data (Zushi system)
  plugin?: () => {
    id: string;
    extensionType: string;
    extensionId: string;
    property: unknown;
  } | undefined;
  // viewer events
  viewerEventsOn: Reearth["viewer"]["on"];
  viewerEventsOff: Reearth["viewer"]["off"];
  // timeline
  timelineManagerRef?: TimelineManagerRef;
  // ui
  render: Reearth["ui"]["show"];
  closeUI: Reearth["ui"]["close"];
  postMessage: Reearth["ui"]["postMessage"];
  resize: Reearth["ui"]["resize"];
  uiEventsOn: Reearth["ui"]["on"];
  uiEventsOff: Reearth["ui"]["off"];
  // modal
  renderModal: Reearth["modal"]["show"];
  closeModal: Reearth["modal"]["close"];
  updateModal: Reearth["modal"]["update"];
  postMessageModal: Reearth["modal"]["postMessage"];
  modalEventsOn: Reearth["modal"]["on"];
  modalEventsOff: Reearth["modal"]["off"];
  // popup
  renderPopup: Reearth["popup"]["show"];
  closePopup: Reearth["popup"]["close"];
  updatePopup: Reearth["popup"]["update"];
  postMessagePopup: Reearth["popup"]["postMessage"];
  popupEventsOn: Reearth["popup"]["on"];
  popupEventsOff: Reearth["popup"]["off"];
  // viewer
  overrideViewerProperty?: (pluginId: string, property: ViewerProperty) => void;
  // extension - getter functions to access latest widget/block/layer (Zushi system)
  getWidget?: () => (() => Widget | undefined) | undefined;
  getBlock?: () => (() => Reearth["extension"]["block"] | undefined) | undefined;
  getLayer?: () => (() => Layer | undefined) | undefined;
  pluginPostMessage: (
    id: string,
    msg: unknown,
    sender: string
  ) => void;
  extensionEventsOn: Reearth["extension"]["on"];
  extensionEventsOff: Reearth["extension"]["off"];
  // data
  clientStorage: ClientStorage;
}): GlobalThis {
  // Helper to safely call getters and handle double-getter pattern
  // Takes a getter that returns either a value or another getter, and unwraps to the final value
  const safeCall = <T,>(
    getter: (() => (() => T | undefined) | undefined) | undefined
  ): T | undefined => {
    if (!getter) return undefined;
    const result = getter();
    if (!result) return undefined;
    // If result is a function, it's a getter-of-getter - call it again
    return typeof result === "function" ? result() : result;
  };

  return merge({
    console: {
      error: console.error,
      log: console.log
    },
    reearth: merge(commonReearth, {
      viewer: merge(commonReearth.viewer, {
        get overrideProperty() {
          return (property: ViewerProperty) => {
            const p = plugin?.();
            overrideViewerProperty?.(
              p ? `${p.id}/${p.extensionId}` : "",
              property
            );
          };
        },
        tools: merge(commonReearth.viewer.tools, {
          get getTerrainHeightAsync() {
            return async (lng: number, lat: number) => {
              return await commonReearth?.viewer?.tools?.getTerrainHeightAsync?.(
                lng,
                lat
              );
            };
          },
          get getCurrentLocationAsync() {
            return async (options?: {
              enableHighAccuracy?: boolean;
              timeout?: number;
              maximumAge?: number;
            }) => {
              return await commonReearth?.viewer?.tools?.getCurrentLocationAsync?.(
                options
              );
            };
          }
        }),
        on: viewerEventsOn,
        off: viewerEventsOff
      }),
      timeline: merge(commonReearth.timeline, {
        get play() {
          return () => {
            const p = plugin?.();
            timelineManagerRef?.current?.commit({
              cmd: "PLAY",
              committer: {
                source: "pluginAPI",
                id:
                  (p?.extensionType === "widget"
                    ? safeCall(getWidget)?.id
                    : p?.extensionType === "block"
                      ? safeCall(getBlock)?.id
                      : "") ?? ""
              }
            });
          };
        },
        get pause() {
          return () => {
            const p = plugin?.();
            return timelineManagerRef?.current?.commit({
              cmd: "PAUSE",
              committer: {
                source: "pluginAPI",
                id:
                  (p?.extensionType === "widget"
                    ? safeCall(getWidget)?.id
                    : p?.extensionType === "block"
                      ? safeCall(getBlock)?.id
                      : "") ?? ""
              }
            });
          };
        },
        get setTime() {
          return (time: {
            start: Date | string;
            stop: Date | string;
            current: Date | string;
          }) => {
            const p = plugin?.();
            return timelineManagerRef?.current?.commit({
              cmd: "SET_TIME",
              payload: { ...time },
              committer: {
                source: "pluginAPI",
                id:
                  (p?.extensionType === "widget"
                    ? safeCall(getWidget)?.id
                    : p?.extensionType === "block"
                      ? safeCall(getBlock)?.id
                      : "") ?? ""
              }
            });
          };
        },
        get setSpeed() {
          return (speed: number) => {
            const p = plugin?.();
            return timelineManagerRef?.current?.commit({
              cmd: "SET_OPTIONS",
              payload: { multiplier: speed },
              committer: {
                source: "pluginAPI",
                id:
                  (p?.extensionType === "widget"
                    ? safeCall(getWidget)?.id
                    : p?.extensionType === "block"
                      ? safeCall(getBlock)?.id
                      : "") ?? ""
              }
            });
          };
        },
        get setStepType() {
          return (stepType: "fixed" | "rate") => {
            const p = plugin?.();
            return timelineManagerRef?.current?.commit({
              cmd: "SET_OPTIONS",
              payload: { stepType },
              committer: {
                source: "pluginAPI",
                id:
                  (p?.extensionType === "widget"
                    ? safeCall(getWidget)?.id
                    : p?.extensionType === "block"
                      ? safeCall(getBlock)?.id
                      : "") ?? ""
              }
            });
          };
        },
        get setRangeType() {
          return (rangeType: "unbounded" | "clamped" | "bounced") => {
            const p = plugin?.();
            return timelineManagerRef?.current?.commit({
              cmd: "SET_OPTIONS",
              payload: { rangeType },
              committer: {
                source: "pluginAPI",
                id:
                  (p?.extensionType === "widget"
                    ? safeCall(getWidget)?.id
                    : p?.extensionType === "block"
                      ? safeCall(getBlock)?.id
                      : "") ?? ""
              }
            });
          };
        }
      }),
      ui: {
        show: render,
        postMessage,
        resize,
        close: closeUI,
        on: uiEventsOn,
        off: uiEventsOff
      },
      modal: {
        show: renderModal,
        postMessage: postMessageModal,
        update: updateModal,
        close: closeModal,
        on: modalEventsOn,
        off: modalEventsOff
      },
      popup: {
        show: renderPopup,
        postMessage: postMessagePopup,
        update: updatePopup,
        close: closePopup,
        on: popupEventsOn,
        off: popupEventsOff
      },
      extension: merge(
        commonReearth.extension,
        {
          get postMessage() {
            return (id: string, msg: unknown) => {
              const p = plugin?.();
              const sender =
                (p?.extensionType === "widget"
                  ? safeCall(getWidget)?.id
                  : ["infoboxBlock", "storyBlock", "block"].includes(
                        p?.extensionType ?? ""
                      )
                    ? safeCall(getBlock)?.id
                    : "") ?? "";
              return pluginPostMessage(id, msg, sender);
            };
          },
          on: extensionEventsOn,
          off: extensionEventsOff
        },
        (() => {
          const p = plugin?.();
          if (p?.extensionType === "widget") {
            return {
              get widget() {
                return safeCall(getWidget);
              }
            };
          }
          return {};
        })(),
        (() => {
          const p = plugin?.();
          if (p?.extensionType === "infoboxBlock" || p?.extensionType === "storyBlock") {
            return {
              get block() {
                return {
                  ...safeCall(getBlock),
                  layer: safeCall(getLayer)
                };
              }
            };
          }
          return {};
        })()
      ),
      data: {
        clientStorage: {
          get getAsync() {
            return (key: string) => {
              const p = plugin?.();
              return clientStorage.getAsync(
                (p?.extensionType === "widget"
                  ? safeCall(getWidget)?.id
                  : p?.extensionType === "block"
                    ? safeCall(getBlock)?.id
                    : "") ?? "",
                key
              );
            };
          },
          get setAsync() {
            return (key: string, value: unknown) => {
              const localValue =
                typeof value === "object"
                  ? JSON.parse(JSON.stringify(value))
                  : value;
              const p = plugin?.();
              return clientStorage.setAsync(
                (p?.extensionType === "widget"
                  ? safeCall(getWidget)?.id
                  : p?.extensionType === "block"
                    ? safeCall(getBlock)?.id
                    : "") ?? "",
                key,
                localValue
              );
            };
          },
          get deleteAsync() {
            return (key: string) => {
              const p = plugin?.();
              return clientStorage.deleteAsync(
                (p?.extensionType === "widget"
                  ? safeCall(getWidget)?.id
                  : p?.extensionType === "block"
                    ? safeCall(getBlock)?.id
                    : "") ?? "",
                key
              );
            };
          },
          get keysAsync() {
            return () => {
              const p = plugin?.();
              return clientStorage.keysAsync(
                (p?.extensionType === "widget"
                  ? safeCall(getWidget)?.id
                  : p?.extensionType === "block"
                    ? safeCall(getBlock)?.id
                    : "") ?? ""
              );
            };
          },
          get dropStoreAsync() {
            return () => {
              const p = plugin?.();
              return clientStorage.dropStore(
                (p?.extensionType === "widget"
                  ? safeCall(getWidget)?.id
                  : p?.extensionType === "block"
                    ? safeCall(getBlock)?.id
                    : "") ?? ""
              );
            };
          }
        }
      }
    })
  });
}
