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
  const context = usePluginContext();

  // Stable callbacks for modal/popup to avoid plugin reloads
  const handleModalShow = useCallback(
    (options?: { background?: string; clickBgToClose?: boolean }) => {
      const instanceId = widget?.id ?? block?.id;
      onPluginModalShow?.({
        id: instanceId,
        background: options?.background,
        clickBgToClose: options?.clickBgToClose
      });
    },
    [widget?.id, block?.id, onPluginModalShow]
  );

  const handlePopupShow = useCallback(
    (options?: PluginPopupInfo) => {
      // Forward the full popup info to the parent
      onPluginPopupShow?.(options);
    },
    [onPluginPopupShow]
  );

  const handleModalClose = useCallback(() => {
    onPluginModalShow?.();
  }, [onPluginModalShow]);

  const handlePopupClose = useCallback(() => {
    onPluginPopupShow?.();
  }, [onPluginPopupShow]);

  // Plugin message sender registration ref
  const pluginMessageSenderRef = useRef<((msg: { data: unknown; sender: string }) => void) | undefined>(undefined);

  // Register/unregister callbacks
  const handleRegisterPluginMessageSender = useCallback(
    (sender: (msg: { data: unknown; sender: string }) => void) => {
      const instanceId = widget?.id ?? block?.id;
      if (instanceId) {
        pluginMessageSenderRef.current = sender;
        context?.pluginInstances.addPluginMessageSender(instanceId, sender);
      }
    },
    [widget?.id, block?.id, context?.pluginInstances]
  );

  const handleUnregisterPluginMessageSender = useCallback(() => {
    const instanceId = widget?.id ?? block?.id;
    if (instanceId) {
      context?.pluginInstances.removePluginMessageSender(instanceId);
      pluginMessageSenderRef.current = undefined;
    }
  }, [widget?.id, block?.id, context?.pluginInstances]);

  // Unregister on unmount
  useEffect(() => {
    return () => {
      if (pluginMessageSenderRef.current) {
        handleUnregisterPluginMessageSender();
      }
    };
  }, [handleUnregisterPluginMessageSender]);

  // Create ReearthPluginContext for Zushi adapter
  const pluginContext = useMemo((): ReearthPluginContext | undefined => {
    if (!pluginId || !extensionId) return undefined;

    return {
      plugin: {
        id: pluginId,
        extensionId,
        extensionType: extensionType ?? "",
        property: pluginProperty
      },
      context,
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
  }, [pluginId, extensionId, extensionType, pluginProperty, context, widget, block, layer, handleModalShow, handlePopupShow, handleModalClose, handlePopupClose, handleRegisterPluginMessageSender, handleUnregisterPluginMessageSender]);

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
