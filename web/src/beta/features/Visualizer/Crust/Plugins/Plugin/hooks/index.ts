import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { type Layer } from "@reearth/core";

import type { InfoboxBlock as Block } from "../../../Infobox/types";
import type { MapRef } from "../../../types";
import type { Widget, WidgetLocationOptions } from "../../../Widgets";
import type { PluginModalInfo } from "../ModalContainer";
import type { PluginPopupInfo } from "../PopupContainer";

import { usePluginAPI } from "./usePluginAPI";

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
