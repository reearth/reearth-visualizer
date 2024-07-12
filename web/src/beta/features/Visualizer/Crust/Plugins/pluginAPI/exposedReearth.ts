import { merge } from "@reearth/beta/utils/object";
import type { Events, Layer, TimelineManagerRef, ViewerProperty } from "@reearth/core";

import type { InfoboxBlock as Block } from "../../Infobox/types";
import type { Widget, WidgetLocationOptions } from "../../Widgets";
import type { ClientStorage } from "../useClientStorage";

import { CommonReearth } from "./commonReearth";
import type { GlobalThis, ReearthEventType, Reearth, PopupPosition } from "./types";

export function exposed({
  commonReearth,
  plugin,
  // timeline
  timelineManagerRef,
  // ui
  render,
  closeUI,
  postMessage,
  resize,
  // modal
  renderModal,
  closeModal,
  updateModal,
  postMessageModal,
  // popup
  renderPopup,
  closePopup,
  updatePopup,
  postMessagePopup,
  // viewer
  overrideViewerProperty,
  // extension
  getWidget,
  getBlock,
  moveWidget,
  startEventLoop,
  pluginPostMessage,
  // data
  clientStorage,

  events,
}: // layer,
{
  commonReearth: CommonReearth;
  plugin?: {
    id: string;
    extensionType: string;
    extensionId: string;
    property: unknown;
  };
  // timeline
  timelineManagerRef?: TimelineManagerRef;

  // ui
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
  // modal
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
  // popup
  renderPopup: Reearth["popup"]["show"];
  closePopup: Reearth["popup"]["close"];
  updatePopup: Reearth["popup"]["update"];
  postMessagePopup: Reearth["popup"]["postMessage"];
  // viewer
  overrideViewerProperty?: (pluginId: string, property: ViewerProperty) => void;
  // extension
  getWidget?: () => Widget | undefined;
  getBlock?: () => Block | undefined;
  moveWidget?: (widgetId: string, options: WidgetLocationOptions) => void;
  startEventLoop?: () => void;
  pluginPostMessage: (extentionId: string, msg: any, sender: string) => void;
  // data
  clientStorage: ClientStorage;

  events: Events<ReearthEventType>;
  layer?: () => Layer | undefined;
}): GlobalThis {
  return merge({
    console: {
      error: console.error,
      log: console.log,
    },
    reearth: merge(commonReearth, {
      viewer: merge(commonReearth.viewer, {
        get overrideProperty() {
          return (property: ViewerProperty) => {
            overrideViewerProperty?.(plugin ? `${plugin.id}/${plugin.extensionId}` : "", property);
          };
        },
        get getTerrainHeightAsync() {
          return async (lng: number, lat: number) => {
            const result = await commonReearth?.viewer?.tools?.getTerrainHeightAsync?.(lng, lat);
            startEventLoop?.();
            return result;
          };
        },
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
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
                    ? getWidget?.()?.id
                    : plugin?.extensionType === "block"
                    ? getBlock?.()?.id
                    : "") ?? "",
              },
            });
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
      extension: merge(
        commonReearth.extension,
        {
          get postMessage() {
            const sender =
              (plugin?.extensionType === "widget"
                ? getWidget?.()?.id
                : ["infoboxBlock", "storyBlock", "block"].includes(plugin?.extensionType ?? "")
                ? getBlock?.()?.id
                : "") ?? "";
            return (id: string, msg: unknown) => pluginPostMessage(id, msg, sender);
          },
        },
        plugin?.extensionType === "widget"
          ? {
              get widget() {
                return {
                  ...getWidget?.(),
                  moveTo: (options: WidgetLocationOptions) => {
                    const widgetId = getWidget?.()?.id;
                    if (!widgetId) return;
                    moveWidget?.(widgetId, options);
                  },
                };
              },
            }
          : {},
        plugin?.extensionType === "block"
          ? {
              get block() {
                return getBlock?.();
              },
            }
          : {},
      ),
      data: {
        clientStorage: {
          get getAsync() {
            return (key: string) => {
              const promise = clientStorage.getAsync(
                (plugin?.extensionType === "widget"
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                  ? getBlock?.()?.id
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
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                  ? getBlock?.()?.id
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
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                  ? getBlock?.()?.id
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
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                  ? getBlock?.()?.id
                  : "") ?? "",
              );
              promise.finally(() => {
                startEventLoop?.();
              });
              return promise;
            };
          },
          get dropStoreAsync() {
            return () => {
              const promise = clientStorage.dropStore(
                (plugin?.extensionType === "widget"
                  ? getWidget?.()?.id
                  : plugin?.extensionType === "block"
                  ? getBlock?.()?.id
                  : "") ?? "",
              );
              promise.finally(() => {
                startEventLoop?.();
              });
              return promise;
            };
          },
        },
      },

      ...events,
    }),
  });
}
