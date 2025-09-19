import { type Layer } from "@reearth/core";
import type { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";

import type {
  InfoboxBlock as Block,
  InfoboxBlock
} from "../../../Infobox/types";
import { StoryBlock } from "../../../StoryPanel/types";
import type { MapRef } from "../../../types";
import { useGet } from "../../../utils";
import type { Widget } from "../../../Widgets";
import { usePluginContext } from "../../context";
import { exposedReearth } from "../../pluginAPI/exposedReearth";
import type {
  CameraEventType,
  ExtensionEventType,
  ExtensionMessage,
  GlobalThis,
  LayersEventType,
  ModalEventType,
  PopupEventType,
  SelectionModeEventType,
  SketchEventType,
  TimelineEventType,
  UIEventType,
  ViewerEventType
} from "../../pluginAPI/types";
import { defaultIsMarshalable } from "../../PluginFrame";
import type { API as IFrameAPI } from "../../PluginFrame";
import { EventEmitter, events, Events, mergeEvents } from "../../utils/events";
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
  onPluginModalShow,
  onPluginPopupShow,
  setUIVisibility,
  onRender,
  onResize
}: {
  pluginId: string | undefined;
  extensionId: string | undefined;
  extensionType: string | undefined;
  mapRef?: RefObject<MapRef>;
  pluginProperty: unknown;
  layer: Layer | undefined;
  block: Block | undefined;
  widget: Widget | undefined;
  modalVisible?: boolean;
  popupVisible?: boolean;
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
      | undefined
  ) => void;
  onResize?: (
    width: string | number | undefined,
    height: string | number | undefined,
    extended: boolean | undefined
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

  const useEventRef = <T extends Record<string, unknown[]>>() =>
    useRef<[Events<T>, EventEmitter<T>, (() => void) | undefined]>();
  const viewerEventsRef = useEventRef<ViewerEventType>();
  const selectionModeEventsRef = useEventRef<SelectionModeEventType>();
  const cameraEventsRef = useEventRef<CameraEventType>();
  const timelineEventsRef = useEventRef<TimelineEventType>();
  const layersEventsRef = useEventRef<LayersEventType>();
  const sketchEventsRef = useEventRef<SketchEventType>();

  const uiEvents = useRef<[Events<UIEventType>, EventEmitter<UIEventType>]>();
  const modalEvents =
    useRef<[Events<ModalEventType>, EventEmitter<ModalEventType>]>();
  const popupEvents =
    useRef<[Events<PopupEventType>, EventEmitter<PopupEventType>]>();
  const extensionEvents =
    useRef<[Events<ExtensionEventType>, EventEmitter<ExtensionEventType>]>();

  const pluginMessageSender = useCallback((msg: ExtensionMessage) => {
    extensionEvents.current?.[1]("extensionMessage", msg);
  }, []);

  const onPreInit = useCallback(() => {
    uiEvents.current = events<UIEventType>();
    modalEvents.current = events<ModalEventType>();
    popupEvents.current = events<PopupEventType>();
    extensionEvents.current = events<ExtensionEventType>();

    initAndMergeEvents(ctx.viewerEvents, viewerEventsRef, [
      "click",
      "doubleClick",
      "mouseDown",
      "mouseUp",
      "rightClick",
      "rightDown",
      "rightUp",
      "middleClick",
      "middleDown",
      "middleUp",
      "mouseMove",
      "mouseEnter",
      "mouseLeave",
      "wheel",
      "resize"
    ]);

    initAndMergeEvents(ctx.selectionModeEvents, selectionModeEventsRef, [
      "marqueeStart",
      "marqueeMove",
      "marqueeEnd"
    ]);

    initAndMergeEvents(ctx.cameraEvents, cameraEventsRef, ["move"]);

    initAndMergeEvents(ctx.timelineEvents, timelineEventsRef, [
      "tick",
      "commit"
    ]);

    initAndMergeEvents(ctx.layersEvents, layersEventsRef, [
      "select",
      "edit",
      "visible",
      "load"
    ]);

    initAndMergeEvents(ctx.sketchEvents, sketchEventsRef, [
      "create",
      "toolChange"
    ]);

    const instanceId = widget?.id ?? block?.id;
    if (instanceId) {
      ctx?.pluginInstances.addPluginMessageSender(
        instanceId,
        pluginMessageSender
      );
      ctx.pluginInstances.runTimesCache.increment(instanceId);
    }
  }, [
    ctx?.viewerEvents,
    ctx?.selectionModeEvents,
    ctx?.cameraEvents,
    ctx?.timelineEvents,
    ctx?.layersEvents,
    ctx?.sketchEvents,
    ctx?.pluginInstances,
    widget?.id,
    block?.id,
    viewerEventsRef,
    selectionModeEventsRef,
    cameraEventsRef,
    timelineEventsRef,
    layersEventsRef,
    sketchEventsRef,
    pluginMessageSender
  ]);

  const onDispose = useCallback(() => {
    uiEvents.current?.[1]("close");
    uiEvents.current = undefined;
    modalEvents.current = undefined;
    popupEvents.current = undefined;
    extensionEvents.current = undefined;

    viewerEventsRef.current?.[2]?.();
    viewerEventsRef.current = undefined;
    selectionModeEventsRef.current?.[2]?.();
    selectionModeEventsRef.current = undefined;
    cameraEventsRef.current?.[2]?.();
    cameraEventsRef.current = undefined;
    timelineEventsRef.current?.[2]?.();
    timelineEventsRef.current = undefined;
    layersEventsRef.current?.[2]?.();
    layersEventsRef.current = undefined;
    sketchEventsRef.current?.[2]?.();
    sketchEventsRef.current = undefined;

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
    viewerEventsRef,
    selectionModeEventsRef,
    cameraEventsRef,
    timelineEventsRef,
    layersEventsRef,
    sketchEventsRef
  ]);

  const isMarshalable = useCallback(
    (target: unknown) => {
      return (
        defaultIsMarshalable(target) ||
        !!mapRef?.current?.layers?.isLayer(target) ||
        !!mapRef?.current?.layers?.isComputedLayer(target)
      );
    },
    [mapRef]
  );

  const staticExposed = useMemo(():
    | ((api: IFrameAPI) => GlobalThis)
    | undefined => {
    return ({ main, modal, popup, messages, startEventLoop }: IFrameAPI) => {
      return exposedReearth({
        commonReearth: ctx.reearth,
        plugin: {
          id: pluginId,
          extensionType,
          extensionId,
          property: pluginProperty
        },
        viewerEventsOn: (type, e, { once } = {}) => {
          if (once) {
            viewerEventsRef.current?.[0]?.once(type, e);
          } else {
            viewerEventsRef.current?.[0]?.on(type, e);
          }
        },
        viewerEventsOff: (type, e) => {
          viewerEventsRef.current?.[0]?.off(type, e);
        },
        getBlock: () => {
          const rawBlock = getBlock() as InfoboxBlock | StoryBlock;
          const block = {
            ...rawBlock,
            property: rawBlock.propertyForPluginAPI
          };
          block.propertyForPluginAPI = undefined;
          block.propertyItemsForPluginBlock = undefined;
          return block;
        },
        getLayer,
        getWidget,
        // ui
        postMessage: main.postMessage,
        render: (html, { extended, ...options } = {}) => {
          main.render(html, options);
          onRender?.(
            typeof extended !== "undefined" || options
              ? { extended, ...options }
              : undefined
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
            clickBgToClose: options?.clickBgToClose
          });
        },
        closeModal: () => {
          onPluginModalShow?.();
        },
        updateModal: (options) => {
          modal.resize(options.width, options.height);
          onPluginModalShow?.({
            id: widget?.id ?? block?.id,
            background: options.background,
            clickBgToClose: options.clickBgToClose
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
          const opt = { ...options, position: options?.position ?? "bottom" };
          popup.render(html, {
            ...opt,
            onAutoResized: () => {
              if (!rendered) {
                onPluginPopupShow?.({
                  id: widget?.id ?? block?.id,
                  ref: externalRef,
                  ...opt
                });
                rendered = true;
              }
            }
          });
          onPluginPopupShow?.({
            id: widget?.id ?? block?.id,
            ref: externalRef,
            ...opt
          });
        },
        closePopup: () => {
          onPluginPopupShow?.();
        },
        updatePopup: (options) => {
          const opt = { ...options, position: options?.position ?? "bottom" };
          if (options.width !== undefined || options.height !== undefined) {
            popup.resize(options.width, options.height);
          }
          onPluginPopupShow?.({
            id: widget?.id ?? block?.id,
            ...opt,
            ref: externalRef
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
        pluginPostMessage: ctx.pluginInstances.postMessage,
        clientStorage: ctx.clientStorage,
        timelineManagerRef: ctx.timelineManagerRef
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
    viewerEventsRef,
    getBlock,
    getLayer,
    getWidget,
    onPluginModalShow,
    onPluginPopupShow,
    setUIVisibility,
    onRender,
    onResize
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
    onPopupClose
  };
}

function initAndMergeEvents<T extends Record<string, unknown[]>>(
  ctxEvents: Events<T> | undefined,
  eventsRef: MutableRefObject<
    [Events<T>, EventEmitter<T>, (() => void) | undefined] | undefined
  >,
  eventKeys: (keyof T)[]
) {
  const e = events<T>();
  let cancel: (() => void) | undefined;
  if (ctxEvents?.on && ctxEvents?.off && ctxEvents?.once) {
    const source: Events<T> = {
      on: ctxEvents.on,
      off: ctxEvents.off,
      once: ctxEvents.once
    };
    cancel = mergeEvents<T>(source, e[1], eventKeys);
  }
  eventsRef.current = [e[0], e[1], cancel];
}
