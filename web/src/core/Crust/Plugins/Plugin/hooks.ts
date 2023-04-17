import type { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import {
  events,
  type Layer,
  mergeEvents,
  type EventEmitter,
  type Events,
  useGet,
} from "@reearth/core/Map";

import type { Block } from "../../Infobox";
import type { MapRef } from "../../types";
import type { Widget, WidgetLocationOptions } from "../../Widgets";
import { exposed } from "../api";
import { usePluginContext } from "../context";
import type { GlobalThis, ReearthEventType } from "../plugin_types";
import { defaultIsMarshalable } from "../PluginFrame";
import type { API as IFrameAPI } from "../PluginFrame";

import type { PluginModalInfo } from "./ModalContainer";
import type { PluginPopupInfo } from "./PopupContainer";

export default function ({
  mapRef,
  onWidgetMove,
  pluginId,
  extensionId,
  pluginBaseUrl,
  extensionType,
  visible,
  block,
  layer,
  widget,
  pluginProperty,
  shownPluginModalInfo,
  onVisibilityChange,
  onPluginModalShow,
  shownPluginPopupInfo,
  onPluginPopupShow,
  onRender,
  onResize,
}: {
  mapRef?: RefObject<MapRef>;
  onWidgetMove?: (widgetId: string, options: WidgetLocationOptions) => void;
  pluginId?: string;
  extensionId?: string;
  pluginBaseUrl?: string;
  extensionType?: string;
  visible?: boolean;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  pluginProperty?: any;
  shownPluginModalInfo?: PluginModalInfo;
  onVisibilityChange?: (widgetId: string, v: boolean) => void;
  onPluginModalShow?: (modalInfo?: PluginModalInfo) => void;
  shownPluginPopupInfo?: PluginPopupInfo;
  onPluginPopupShow?: (modalInfo?: PluginModalInfo) => void;
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
}) {
  const externalRef = useRef<HTMLIFrameElement>(null);

  const [uiVisible, setUIVisibility] = useState<boolean>(!!visible);
  const [modalVisible, setModalVisibility] = useState<boolean>(false);
  const [popupVisible, setPopupVisibility] = useState<boolean>(false);

  const handleSetVisibility = useCallback(
    (v: boolean) => {
      setUIVisibility(v);
      const instanceId = widget?.id ?? block?.id;
      if (instanceId) {
        onVisibilityChange?.(instanceId, v);
      }
    },
    [onVisibilityChange, widget?.id, block?.id],
  );

  const { staticExposed, isMarshalable, onPreInit, onDispose, onModalClose, onPopupClose } =
    useAPI({
      extensionId,
      extensionType,
      pluginId,
      block,
      layer,
      widget,
      pluginProperty,
      modalVisible,
      popupVisible,
      externalRef,
      onPluginModalShow,
      onPluginPopupShow,
      setUIVisibility: handleSetVisibility,
      onRender,
      onResize,
      mapRef,
      onWidgetMove,
    }) ?? [];

  useEffect(() => {
    const visible = shownPluginModalInfo?.id === (widget?.id ?? block?.id);
    if (modalVisible !== visible) {
      setModalVisibility(visible);
      if (!visible) {
        onModalClose();
      }
    }
  }, [
    modalVisible,
    shownPluginModalInfo,
    pluginId,
    extensionId,
    widget?.id,
    block?.id,
    onModalClose,
  ]);

  useEffect(() => {
    const visible = shownPluginPopupInfo?.id === (widget?.id ?? block?.id);
    if (popupVisible !== visible) {
      setPopupVisibility(visible);
      if (!visible) {
        onPopupClose();
      }
    }
  }, [
    popupVisible,
    shownPluginPopupInfo,
    pluginId,
    extensionId,
    widget?.id,
    block?.id,
    onPopupClose,
  ]);

  const onError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId],
  );

  const src =
    pluginId && extensionId
      ? `${pluginBaseUrl}/${`${pluginId}/${extensionId}`.replace(/\.\./g, "")}.js`
      : undefined;

  return {
    skip: !staticExposed,
    src,
    isMarshalable,
    uiVisible,
    modalVisible,
    popupVisible,
    externalRef,
    exposed: staticExposed,
    onError,
    onPreInit,
    onDispose,
  };
}

export function useAPI({
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

  const event =
    useRef<[Events<ReearthEventType>, EventEmitter<ReearthEventType>, (() => void) | undefined]>();

  const pluginMessageSender = useCallback((msg: any) => {
    event.current?.[1]("pluginmessage", msg);
  }, []);

  const onPreInit = useCallback(() => {
    const e = events<ReearthEventType>();
    let cancel: (() => void) | undefined;

    if (ctx?.reearth.on && ctx.reearth.off && ctx.reearth.once) {
      const source: Events<ReearthEventType> = {
        on: ctx.reearth.on,
        off: ctx.reearth.off,
        once: ctx.reearth.once,
      };
      cancel = mergeEvents<ReearthEventType>(source, e[1], [
        "cameramove",
        "select",
        "click",
        "doubleclick",
        "mousedown",
        "mouseup",
        "rightclick",
        "rightdown",
        "rightup",
        "middleclick",
        "middledown",
        "middleup",
        "mousemove",
        "mouseenter",
        "mouseleave",
        "wheel",
        "tick",
        "resize",
        "layeredit",
      ]);
    }

    event.current = [e[0], e[1], cancel];

    const instanceId = widget?.id ?? block?.id;
    if (instanceId) {
      ctx?.pluginInstances.addPluginMessageSender(instanceId, pluginMessageSender);
      ctx.pluginInstances.runTimesCache.increment(instanceId);
    }
  }, [
    ctx?.reearth.on,
    ctx?.reearth.off,
    ctx?.reearth.once,
    ctx?.pluginInstances,
    widget?.id,
    block?.id,
    pluginMessageSender,
  ]);

  const onDispose = useCallback(() => {
    event.current?.[1]("close");
    event.current?.[2]?.();
    event.current = undefined;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPluginModalShow, onPluginPopupShow]);

  const isMarshalable = useCallback(
    (target: any) => defaultIsMarshalable(target) || !!mapRef?.current?.layers?.isLayer(target),
    [mapRef],
  );

  const staticExposed = useMemo((): ((api: IFrameAPI) => GlobalThis) | undefined => {
    return ({ main, modal, popup, messages, startEventLoop }: IFrameAPI) => {
      return exposed({
        commonReearth: ctx.reearth,
        events: {
          on: (type, e) => {
            if (type === "message") {
              messages.on(e as (msg: any) => void);
              return;
            }
            event.current?.[0]?.on(type, e);
          },
          off: (type, e) => {
            if (type === "message") {
              messages.off(e as (msg: any) => void);
              return;
            }
            event.current?.[0]?.on(type, e);
          },
          once: (type, e) => {
            if (type === "message") {
              messages.once(e as (msg: any) => void);
              return;
            }
            event.current?.[0]?.on(type, e);
          },
        },
        plugin: {
          id: pluginId,
          extensionType,
          extensionId,
          property: pluginProperty,
        },
        block: getBlock,
        layer: getLayer,
        widget: getWidget,
        postMessage: main.postMessage,
        render: (html, { extended, ...options } = {}) => {
          main.render(html, options);
          onRender?.(
            typeof extended !== "undefined" || options ? { extended, ...options } : undefined,
          );
          setUIVisibility(true);
        },
        closeUI: () => {
          setUIVisibility(false);
        },
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
        resize: (width, height, extended) => {
          main.resize(width, height);
          onResize?.(width, height, extended);
        },
        startEventLoop,
        overrideSceneProperty: ctx.overrideSceneProperty,
        moveWidget: onWidgetMove,
        pluginPostMessage: ctx.pluginInstances.postMessage,
        clientStorage: ctx.clientStorage,
      });
    };
  }, [
    ctx?.reearth,
    ctx?.pluginInstances,
    ctx?.clientStorage,
    ctx?.overrideSceneProperty,
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
    event.current?.[1]("update");
  }, [block, layer, widget, ctx?.reearth.scene.property]);

  const onModalClose = useCallback(() => {
    event.current?.[1]("modalclose");
  }, []);

  const onPopupClose = useCallback(() => {
    event.current?.[1]("popupclose");
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
