import { type Layer } from "@reearth/core";
import {
  useDevPluginExtensionRenderKey,
  useDevPluginExtensions
} from "@reearth/services/state";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import type { InfoboxBlock as Block } from "../../../Infobox/types";
import type { MapRef } from "../../../types";
import type { Widget } from "../../../Widgets";
import { usePluginContext } from "../../context";
import type { ReearthPluginContext } from "../../pluginAPI/zushiAdapter";
import type { PluginModalInfo } from "../ModalContainer";
import type { PluginPopupInfo } from "../PopupContainer";

import { usePluginAPI } from "./usePluginAPI";

export default function ({
  mapRef,
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
  onResize
}: {
  mapRef?: RefObject<MapRef | null>;
  pluginId?: string;
  extensionId?: string;
  pluginBaseUrl?: string;
  extensionType?: string;
  visible?: boolean;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  pluginProperty?: unknown;
  shownPluginModalInfo?: PluginModalInfo;
  shownPluginPopupInfo?: PluginPopupInfo;
  onVisibilityChange?: (widgetId: string, v: boolean) => void;
  onPluginModalShow?: (modalInfo?: PluginModalInfo) => void;
  onPluginPopupShow?: (modalInfo?: PluginModalInfo) => void;
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
}) {
  const externalRef = useRef<HTMLIFrameElement>(null);
  const uiContainerRef = useRef<HTMLElement>(null);

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
    [onVisibilityChange, widget?.id, block?.id]
  );

  const {
    staticExposed,
    isMarshalable,
    onPreInit,
    onDispose,
    onModalClose,
    onPopupClose
  } =
    usePluginAPI({
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
      mapRef
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
    onModalClose
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
    onPopupClose
  ]);

  const onError = useCallback(
    (err: unknown) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId]
  );

  const [devPluginExtensions] = useDevPluginExtensions();

  const devPluginExtensionSrc = useMemo(() => {
    if (!devPluginExtensions) return;
    return devPluginExtensions.find((e) => e.id === extensionId)?.url;
  }, [devPluginExtensions, extensionId]);

  const src = useMemo(
    () =>
      pluginId && extensionId
        ? (devPluginExtensionSrc ??
          `${pluginBaseUrl}/${`${pluginId}/${extensionId}`.replace(/\.\./g, "")}.js`)
        : undefined,
    [devPluginExtensionSrc, pluginBaseUrl, pluginId, extensionId]
  );
  const [devPluginExtensionRenderKey] = useDevPluginExtensionRenderKey();

  const renderKey = useMemo(
    () => (devPluginExtensionSrc ? devPluginExtensionRenderKey : undefined),
    [devPluginExtensionRenderKey, devPluginExtensionSrc]
  );

  // Get the plugin context for Zushi
  // Note: usePluginContext now returns from a stable ref, so it doesn't cause rerenders
  const context = usePluginContext();

  /**
   * Stable Callbacks with Refs Pattern
   *
   * WHY: These callbacks are passed to the Zushi plugin via `pluginContext` object.
   * If the callbacks change, `pluginContext` must be recreated, which triggers the
   * useEffect in useZushiPlugin that disposes and reinitializes the plugin.
   * Plugin initialization is expensive (QuickJS runtime + code loading).
   *
   * PROBLEM: Props like `onPluginModalShow`, `widget`, `block` change frequently,
   * which would normally require recreating the callbacks.
   *
   * SOLUTION: Create callbacks with empty dependencies (stable identity), but read
   * the latest values from refs inside the callback body.
   *
   * HOW:
   * 1. Store context and callback dependencies in refs
   * 2. Update refs on every render via useEffect
   * 3. Create callbacks with empty deps array (stable identity)
   * 4. Inside callbacks, read latest values from refs
   *
   * TRADE-OFF: More complex code, but prevents expensive plugin remounts.
   */
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  });

  const callbacksRef = useRef({
    onPluginModalShow,
    onPluginPopupShow,
    widget,
    block
  });

  useEffect(() => {
    callbacksRef.current = {
      onPluginModalShow,
      onPluginPopupShow,
      widget,
      block
    };
  });

  // Stable callbacks that use refs internally to access latest values
  const handleModalShow = useCallback(
    (options?: { background?: string; clickBgToClose?: boolean }) => {
      const instanceId = callbacksRef.current.widget?.id ?? callbacksRef.current.block?.id;
      callbacksRef.current.onPluginModalShow?.({
        id: instanceId,
        background: options?.background,
        clickBgToClose: options?.clickBgToClose
      });
    },
    [] // Empty deps = stable callback identity
  );

  const handlePopupShow = useCallback(
    (options?: PluginPopupInfo) => {
      callbacksRef.current.onPluginPopupShow?.(options);
    },
    []
  );

  const handleModalClose = useCallback(() => {
    callbacksRef.current.onPluginModalShow?.();
  }, []);

  const handlePopupClose = useCallback(() => {
    callbacksRef.current.onPluginPopupShow?.();
  }, []);

  // Plugin message sender registration ref
  const pluginMessageSenderRef = useRef<((msg: { data: unknown; sender: string }) => void) | undefined>(undefined);

  // Register/unregister callbacks using refs
  const handleRegisterPluginMessageSender = useCallback(
    (sender: (msg: { data: unknown; sender: string }) => void) => {
      const instanceId = callbacksRef.current.widget?.id ?? callbacksRef.current.block?.id;
      if (instanceId) {
        pluginMessageSenderRef.current = sender;
        contextRef.current?.pluginInstances.addPluginMessageSender(instanceId, sender);
      }
    },
    []
  );

  const handleUnregisterPluginMessageSender = useCallback(() => {
    const instanceId = callbacksRef.current.widget?.id ?? callbacksRef.current.block?.id;
    if (instanceId) {
      contextRef.current?.pluginInstances.removePluginMessageSender(instanceId);
      pluginMessageSenderRef.current = undefined;
    }
  }, []);

  // Unregister on unmount
  useEffect(() => {
    return () => {
      if (pluginMessageSenderRef.current) {
        handleUnregisterPluginMessageSender();
      }
    };
  }, [handleUnregisterPluginMessageSender]);

  /**
   * ReearthPluginContext with Context Getter Pattern
   *
   * WHY: This object is passed to useZushiPlugin and is in its useEffect dependencies.
   * If this object changes, the plugin will be disposed and reinitialized.
   *
   * PROBLEM: The `context` object contains data that changes frequently (e.g., when
   * blocks are added/removed). Normally, we'd include `context` in the useMemo deps,
   * causing pluginContext to be recreated and triggering plugin remount.
   *
   * SOLUTION: Use a getter property that reads from contextRef. The pluginContext
   * object itself remains stable, but accessing `.context` returns the latest value.
   *
   * HOW:
   * 1. Store context in contextRef (updated every render)
   * 2. Use `get context()` getter in pluginContext object
   * 3. Omit context from useMemo dependencies
   * 4. When Zushi adapter accesses pluginContext.context, it gets the latest value
   *
   * TRADE-OFF: Non-standard pattern (getters in plain objects), but prevents plugin
   * remounts when context data changes while still providing access to latest data.
   */
  const pluginContext = useMemo((): ReearthPluginContext | undefined => {
    if (!pluginId || !extensionId) return undefined;

    return {
      plugin: {
        id: pluginId,
        extensionId,
        extensionType: extensionType ?? "",
        property: pluginProperty
      },
      // Getter accesses latest context from ref without recreating pluginContext
      get context() {
        return contextRef.current;
      },
      getWidget: widget ? () => widget : undefined,
      getBlock: block ? () => block : undefined,
      getLayer: layer ? () => layer : undefined,
      getUIContainerRef: () => uiContainerRef,
      onRender: (_type: string) => {
        // Handle onRender callback if needed
      },
      onModalShow: handleModalShow,
      onPopupShow: handlePopupShow,
      onModalClose: handleModalClose,
      onPopupClose: handlePopupClose,
      registerPluginMessageSender: handleRegisterPluginMessageSender,
      unregisterPluginMessageSender: handleUnregisterPluginMessageSender
    };
    // Removed context from dependencies - use getter to access latest value
    // Callbacks are stable, only recreate when plugin identity changes
  }, [
    pluginId,
    extensionId,
    extensionType,
    pluginProperty,
    widget,
    block,
    layer,
    handleModalShow,
    handlePopupShow,
    handleModalClose,
    handlePopupClose,
    handleRegisterPluginMessageSender,
    handleUnregisterPluginMessageSender
  ]);

  return {
    skip: !staticExposed || !pluginContext,
    src,
    isMarshalable,
    uiVisible,
    modalVisible,
    popupVisible,
    externalRef,
    uiContainerRef,
    renderKey,
    exposed: staticExposed,
    pluginContext, // Added for Zushi
    onError,
    onPreInit,
    onDispose
  };
}
