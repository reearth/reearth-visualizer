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
  plugin?: {
    id: string;
    extensionType: string;
    extensionId: string;
    property: unknown;
  };
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
  // extension
  getWidget?: () => Widget | undefined;
  getBlock?: () => Reearth["extension"]["block"] | undefined;
  getLayer?: () => Layer | undefined;
  pluginPostMessage: (
    extentionId: string,
    msg: unknown,
    sender: string
  ) => void;
  extensionEventsOn: Reearth["extension"]["on"];
  extensionEventsOff: Reearth["extension"]["off"];
  // data
  clientStorage: ClientStorage;
}): GlobalThis {
  return merge({
    console: {
      error: console.error,
      log: console.log
    },
    reearth: merge(commonReearth, {
      viewer: merge(commonReearth.viewer, {
        get overrideProperty() {
          return (property: ViewerProperty) => {
            overrideViewerProperty?.(
              plugin ? `${plugin.id}/${plugin.extensionId}` : "",
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
            timelineManagerRef?.current?.commit({
              cmd: "PLAY",
              committer: {
                source: "pluginAPI",
                id:
                  (plugin?.extensionType === "widget"
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                      ? getBlock?.()?.id
                      : "") ?? ""
              }
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                      ? getBlock?.()?.id
                      : "") ?? ""
              }
            });
        },
        get setTime() {
          return (time: {
            start: Date | string;
            stop: Date | string;
            current: Date | string;
          }) =>
            timelineManagerRef?.current?.commit({
              cmd: "SET_TIME",
              payload: { ...time },
              committer: {
                source: "pluginAPI",
                id:
                  (plugin?.extensionType === "widget"
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                      ? getBlock?.()?.id
                      : "") ?? ""
              }
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                      ? getBlock?.()?.id
                      : "") ?? ""
              }
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                      ? getBlock?.()?.id
                      : "") ?? ""
              }
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                      ? getBlock?.()?.id
                      : "") ?? ""
              }
            });
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
            const sender =
              (plugin?.extensionType === "widget"
                ? getWidget?.()?.id
                : ["infoboxBlock", "storyBlock", "block"].includes(
                      plugin?.extensionType ?? ""
                    )
                  ? getBlock?.()?.id
                  : "") ?? "";
            return (id: string, msg: unknown) =>
              pluginPostMessage(id, msg, sender);
          },
          on: extensionEventsOn,
          off: extensionEventsOff
        },
        plugin?.extensionType === "widget"
          ? {
              get widget() {
                return getWidget?.();
              }
            }
          : {},
        plugin?.extensionType === "infoboxBlock" ||
          plugin?.extensionType === "storyBlock"
          ? {
              get block() {
                return {
                  ...getBlock?.(),
                  layer: getLayer?.()
                };
              }
            }
          : {}
      ),
      data: {
        clientStorage: {
          get getAsync() {
            return (key: string) => {
              return clientStorage.getAsync(
                (plugin?.extensionType === "widget"
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
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
              return clientStorage.setAsync(
                (plugin?.extensionType === "widget"
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
                    : "") ?? "",
                key,
                localValue
              );
            };
          },
          get deleteAsync() {
            return (key: string) => {
              return clientStorage.deleteAsync(
                (plugin?.extensionType === "widget"
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
                    : "") ?? "",
                key
              );
            };
          },
          get keysAsync() {
            return () => {
              return clientStorage.keysAsync(
                (plugin?.extensionType === "widget"
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
                    : "") ?? ""
              );
            };
          },
          get dropStoreAsync() {
            return () => {
              return clientStorage.dropStore(
                (plugin?.extensionType === "widget"
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
                    : "") ?? ""
              );
            };
          }
        }
      }
    })
  });
}
