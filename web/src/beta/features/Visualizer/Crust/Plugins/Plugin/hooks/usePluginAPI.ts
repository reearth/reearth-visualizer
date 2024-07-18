import type { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";

import { type Layer } from "@reearth/core";

import type { InfoboxBlock as Block } from "../../../Infobox/types";
import type { MapRef } from "../../../types";
import { useGet } from "../../../utils";
import type { Widget, WidgetLocationOptions } from "../../../Widgets";
import { usePluginContext } from "../../context";
import { exposedReearth } from "../../pluginAPI/exposedReearth";
import type {
  ExtensionEventType,
  GlobalThis,
  ModalEventType,
  PopupEventType,
  UIEventType,
} from "../../pluginAPI/types";
import { defaultIsMarshalable } from "../../PluginFrame";
import type { API as IFrameAPI } from "../../PluginFrame";
import { EventEmitter, events, Events } from "../../utils/events";
import { PluginModalInfo } from "../ModalContainer";
import { PluginPopupInfo } from "../PopupContainer";

export function usePluginAPI({
  pluginId = "",
  extensionId = "",
  extensionType = "",
  mapRef,
  pluginProperty,
  layer,
  block,
  widget,
  modalVisible,
  popupVisible,
  externalRef,
  onWidgetMove,
  onPluginModalShow,
  onPluginPopupShow,
  setUIVisibility,
  onRender,
  onResize,
}: {
  pluginId: string | undefined;
  extensionId: string | undefined;
  extensionType: string | undefined;
  mapRef?: RefObject<MapRef>;
  pluginProperty: any;
  layer: Layer | undefined;
  block: Block | undefined;
  widget: Widget | undefined;
  modalVisible?: boolean;
  popupVisible?: boolean;
  externalRef: RefObject<HTMLIFrameElement> | undefined;
  onPluginModalShow?: (modalInfo?: PluginModalInfo) => void;
  onPluginPopupShow?: (popupInfo?: PluginPopupInfo) => void;
  setUIVisibility: (visible: boolean) => void;
  onWidgetMove?: (widgetId: string, options: WidgetLocationOptions) => void;
  onRender?: (
    options:
      | {
          width?: string | number;
          height?: string | number;
          extended?: boolean;
        }
      | undefined,
  ) => void;
  onResize?: (
    width: string | number | undefined,
    height: string | number | undefined,
    extended: boolean | undefined,
  ) => void;
}): {
  staticExposed: ((api: IFrameAPI) => GlobalThis) | undefined;
  isMarshalable: Options["isMarshalable"] | undefined;
  onPreInit: () => void;
  onDispose: () => void;
  onModalClose: () => void;
  onPopupClose: () => void;
} {
  const ctx = usePluginContext();
  const getLayer = useGet(layer);
  const getBlock = useGet(block);
  const getWidget = useGet(widget);

  // const event =
  //   useRef<[Events<ReearthEventType>, EventEmitter<ReearthEventType>, (() => void) | undefined]>();

  const uiEvents = useRef<[Events<UIEventType>, EventEmitter<UIEventType>]>();
  const modalEvents = useRef<[Events<ModalEventType>, EventEmitter<ModalEventType>]>();
  const popupEvents = useRef<[Events<PopupEventType>, EventEmitter<PopupEventType>]>();
  const extensionEvents = useRef<[Events<ExtensionEventType>, EventEmitter<ExtensionEventType>]>();

  const pluginMessageSender = useCallback((msg: any) => {
    extensionEvents.current?.[1]("extensionMessage", msg);
  }, []);

  const onPreInit = useCallback(() => {
    // const e = events<ReearthEventType>();

    uiEvents.current = events<UIEventType>();
    modalEvents.current = events<ModalEventType>();
    popupEvents.current = events<PopupEventType>();

    // let cancel: (() => void) | undefined;

    // if (ctx?.reearth.on && ctx.reearth.off && ctx.reearth.once) {
    //   const source: Events<CommonReearthEventType> = {
    //     on: ctx.reearth.on,
    //     off: ctx.reearth.off,
    //     once: ctx.reearth.once,
    //   };
    //   cancel = mergeEvents<ReearthEventType>(source, e[1], [
    //     "cameramove",
    //     "select",
    //     "click",
    //     "doubleclick",
    //     "mousedown",
    //     "mouseup",
    //     "rightclick",
    //     "rightdown",
    //     "rightup",
    //     "middleclick",
    //     "middledown",
    //     "middleup",
    //     "mousemove",
    //     "mouseenter",
    //     "mouseleave",
    //     "wheel",
    //     "tick",
    //     "timelinecommit",
    //     "resize",
    //     "layeredit",
    //     "sketchfeaturecreated",
    //     "sketchtoolchange",
    //     "layerVisibility",
    //     "layerload",
    //     "layerSelectWithRectStart",
    //     "layerSelectWithRectMove",
    //     "layerSelectWithRectEnd",
    //   ]);
    // }

    // event.current = [e[0], e[1], cancel];

    const instanceId = widget?.id ?? block?.id;
    if (instanceId) {
      ctx?.pluginInstances.addPluginMessageSender(instanceId, pluginMessageSender);
      ctx.pluginInstances.runTimesCache.increment(instanceId);
    }
  }, [
    // ctx?.reearth.on,
    // ctx?.reearth.off,
    // ctx?.reearth.once,
    ctx?.pluginInstances,
    widget?.id,
    block?.id,
    pluginMessageSender,
  ]);

  const onDispose = useCallback(() => {
    uiEvents.current?.[1]("close");
    uiEvents.current = undefined;
    modalEvents.current = undefined;
    popupEvents.current = undefined;
    extensionEvents.current = undefined;

    // event.current?.[1]("close");
    // event.current?.[2]?.();
    // event.current = undefined;
    if (modalVisible) {
      onPluginModalShow?.();
    }
    if (popupVisible) {
      onPluginPopupShow?.();
    }
    const instanceId = widget?.id ?? block?.id;
    if (instanceId) {
      ctx?.pluginInstances.removePluginMessageSender(instanceId);
    }
  }, [
    onPluginModalShow,
    onPluginPopupShow,
    modalVisible,
    popupVisible,
    widget?.id,
    block?.id,
    ctx?.pluginInstances,
  ]);

  const isMarshalable = useCallback(
    (target: any) => defaultIsMarshalable(target) || !!mapRef?.current?.layers?.isLayer(target),
    [mapRef],
  );

  const staticExposed = useMemo((): ((api: IFrameAPI) => GlobalThis) | undefined => {
    return ({ main, modal, popup, messages, startEventLoop }: IFrameAPI) => {
      return exposedReearth({
        commonReearth: ctx.reearth,
        plugin: {
          id: pluginId,
          extensionType,
          extensionId,
          property: pluginProperty,
        },
        getBlock,
        getLayer,
        getWidget,
        // ui
        postMessage: main.postMessage,
        render: (html, { extended, ...options } = {}) => {
          main.render(html, options);
          onRender?.(
            typeof extended !== "undefined" || options ? { extended, ...options } : undefined,
          );
          setUIVisibility(true);
        },
        resize: (width, height, extended) => {
          main.resize(width, height);
          onResize?.(width, height, extended);
        },
        closeUI: () => {
          setUIVisibility(false);
        },
        uiEventsOn: (type, e, { once } = {}) => {
          if (once) {
            uiEvents.current?.[0]?.once(type, e);
          } else {
            uiEvents.current?.[0]?.on(type, e);
          }
        },
        uiEventsOff: (type, e) => {
          uiEvents.current?.[0]?.off(type, e);
        },
        // modal
        renderModal: (html, { ...options } = {}) => {
          modal.render(html, options);
          onPluginModalShow?.({
            id: widget?.id ?? block?.id,
            background: options?.background,
          });
        },
        closeModal: () => {
          onPluginModalShow?.();
        },
        updateModal: options => {
          modal.resize(options.width, options.height);
          onPluginModalShow?.({
            id: widget?.id ?? block?.id,
            background: options.background,
          });
        },
        postMessageModal: modal.postMessage,
        modalEventsOn: (type, e, { once } = {}) => {
          if (once) {
            modalEvents.current?.[0]?.once(type, e);
          } else {
            modalEvents.current?.[0]?.on(type, e);
          }
        },
        modalEventsOff: (type, e) => {
          modalEvents.current?.[0]?.off(type, e);
        },
        // popup
        renderPopup: (html, { ...options } = {}) => {
          let rendered = false;
          popup.render(html, {
            ...options,
            onAutoResized: () => {
              if (!rendered) {
                onPluginPopupShow?.({
                  id: widget?.id ?? block?.id,
                  ref: externalRef,
                  ...options,
                });
                rendered = true;
              }
            },
          });
          onPluginPopupShow?.({
            id: widget?.id ?? block?.id,
            ref: externalRef,
            ...options,
          });
        },
        closePopup: () => {
          onPluginPopupShow?.();
        },
        updatePopup: options => {
          if (options.width !== undefined || options.height !== undefined) {
            popup.resize(options.width, options.height);
          }
          onPluginPopupShow?.({
            id: widget?.id ?? block?.id,
            ...options,
            ref: externalRef,
          });
        },
        postMessagePopup: popup.postMessage,
        popupEventsOn: (type, e, { once } = {}) => {
          if (once) {
            popupEvents.current?.[0]?.once(type, e);
          } else {
            popupEvents.current?.[0]?.on(type, e);
          }
        },
        popupEventsOff: (type, e) => {
          popupEvents.current?.[0]?.off(type, e);
        },
        // extension
        extensionEventsOn: (type, e, { once } = {}) => {
          if (once) {
            if (type === "message") {
              messages.once(e as (msg: unknown) => void);
              return;
            }
            extensionEvents.current?.[0]?.once(type, e);
          } else {
            if (type === "message") {
              messages.on(e as (msg: unknown) => void);
              return;
            }
            extensionEvents.current?.[0]?.on(type, e);
          }
        },
        extensionEventsOff: (type, e) => {
          if (type === "message") {
            messages.off(e as (msg: unknown) => void);
            return;
          }
          extensionEvents.current?.[0]?.off(type, e);
        },
        //
        startEventLoop,
        overrideViewerProperty: ctx.overrideViewerProperty,
        moveWidget: onWidgetMove,
        pluginPostMessage: ctx.pluginInstances.postMessage,
        clientStorage: ctx.clientStorage,
        timelineManagerRef: ctx.timelineManagerRef,
      });
    };
  }, [
    ctx?.reearth,
    ctx?.pluginInstances,
    ctx?.clientStorage,
    ctx?.timelineManagerRef,
    ctx?.overrideViewerProperty,
    extensionId,
    extensionType,
    pluginId,
    pluginProperty,
    widget?.id,
    block?.id,
    externalRef,
    getBlock,
    getLayer,
    getWidget,
    onPluginModalShow,
    onPluginPopupShow,
    setUIVisibility,
    onRender,
    onResize,
    onWidgetMove,
  ]);

  useEffect(() => {
    uiEvents.current?.[1]("update");
  }, [block, layer, widget, ctx?.reearth.viewer.property]);

  const onModalClose = useCallback(() => {
    modalEvents.current?.[1]("close");
  }, []);

  const onPopupClose = useCallback(() => {
    popupEvents.current?.[1]("close");
  }, []);

  return {
    staticExposed,
    isMarshalable,
    onPreInit,
    onDispose,
    onModalClose,
    onPopupClose,
  };
}
