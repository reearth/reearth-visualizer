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

  return {
    skip: !staticExposed,
    src,
    isMarshalable,
    uiVisible,
    modalVisible,
    popupVisible,
    externalRef,
    renderKey,
    exposed: staticExposed,
    onError,
    onPreInit,
    onDispose
  };
}
