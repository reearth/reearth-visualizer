import { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo, useRef, MutableRefObject, useState } from "react";
import type { RefObject } from "react";

import type { API as IFrameAPI } from "@reearth/components/atoms/Plugin";
import { defaultIsMarshalable } from "@reearth/components/atoms/Plugin";
import events, { EventEmitter, Events, mergeEvents } from "@reearth/util/event";

import { useGet } from "../utils";

import { exposed } from "./api";
import { useContext } from "./context";
import type { PluginModalInfo } from "./ModalContainer";
import type { PluginPopupInfo } from "./PopupContainer";
import type { Layer, Widget, Block, GlobalThis, ReearthEventType } from "./types";

export default function ({
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
  onPluginModalShow,
  shownPluginPopupInfo,
  onPluginPopupShow,
  onRender,
  onResize,
}: {
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
  const modalVisible = useRef<boolean>(false);
  const popupVisible = useRef<boolean>(false);
  const externalRef = useRef<HTMLIFrameElement>(null);

  const [uiVisible, setUIVisibility] = useState<boolean>(!!visible);

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
      setUIVisibility,
      onRender,
      onResize,
    }) ?? [];

  useEffect(() => {
    const visible = shownPluginModalInfo?.id === (widget?.id ?? block?.id);
    if (modalVisible.current !== visible) {
      modalVisible.current = visible;
      if (!modalVisible.current) {
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
    if (popupVisible.current !== visible) {
      popupVisible.current = visible;
      if (!popupVisible.current) {
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
    modalVisible: modalVisible.current,
    popupVisible: popupVisible.current,
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
  pluginProperty,
  layer,
  block,
  widget,
  modalVisible,
  popupVisible,
  externalRef,
  onPluginModalShow,
  onPluginPopupShow,
  setUIVisibility,
  onRender,
  onResize,
}: {
  pluginId: string | undefined;
  extensionId: string | undefined;
  extensionType: string | undefined;
  pluginProperty: any;
  layer: Layer | undefined;
  block: Block | undefined;
  widget: Widget | undefined;
  modalVisible?: MutableRefObject<boolean>;
  popupVisible?: MutableRefObject<boolean>;
  externalRef: RefObject<HTMLIFrameElement> | undefined;
  onPluginModalShow?: (modalInfo?: PluginModalInfo) => void;
  onPluginPopupShow?: (popupInfo?: PluginPopupInfo) => void;
  setUIVisibility: (visible: boolean) => void;
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
  const ctx = useContext();
  const getLayer = useGet(layer);
  const getBlock = useGet(block);
  const getWidget = useGet(widget);

  const event =
    useRef<[Events<ReearthEventType>, EventEmitter<ReearthEventType>, (() => void) | undefined]>();

  const onPreInit = useCallback(() => {
    const e = events<ReearthEventType>();
    let cancel: (() => void) | undefined;

    if (ctx?.reearth.on && ctx.reearth.off && ctx.reearth.once) {
      const source: Events<ReearthEventType> = {
        on: ctx.reearth.on,
        off: ctx.reearth.off,
        once: ctx.reearth.once,
      };
      cancel = mergeEvents(source, e[1], [
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
      ]);
    }

    event.current = [e[0], e[1], cancel];
  }, [ctx?.reearth.on, ctx?.reearth.off, ctx?.reearth.once]);

  const onDispose = useCallback(() => {
    event.current?.[1]("close");
    event.current?.[2]?.();
    event.current = undefined;
    if (modalVisible?.current) {
      onPluginModalShow?.();
    }
    if (popupVisible?.current) {
      onPluginPopupShow?.();
    }
  }, [modalVisible, onPluginModalShow, popupVisible, onPluginPopupShow]);

  const isMarshalable = useCallback(
    (target: any) => defaultIsMarshalable(target) || !!ctx?.reearth.layers.isLayer(target),
    [ctx?.reearth.layers],
  );

  const staticExposed = useMemo((): ((api: IFrameAPI) => GlobalThis) | undefined => {
    if (!ctx?.reearth) return;
    return ({ main, modal, popup, messages }: IFrameAPI) => {
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
        overrideSceneProperty: ctx.overrideSceneProperty,
      });
    };
  }, [
    ctx?.reearth,
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
