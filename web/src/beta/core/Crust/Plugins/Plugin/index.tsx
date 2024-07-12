import type { RefObject } from "react";

import type { Layer } from "@reearth/classic/core/mantle";

import type { Block } from "../../Infobox";
import type { MapRef } from "../../types";
import type { Widget, WidgetLocationOptions } from "../../Widgets";
import P, { type Props as PluginProps } from "../PluginFrame";

import useHooks from "./hooks";
import type { PluginModalInfo } from "./ModalContainer";
import type { PluginPopupInfo } from "./PopupContainer";

export { default as PopupContainer, type PluginPopupInfo } from "./PopupContainer";
export { default as ModalContainer, type PluginModalInfo } from "./ModalContainer";

export type CommonProps = {
  pluginProperty?: any; // Taken from Visualizer
  pluginBaseUrl?: string; // Taken from Visualizer
  pluginModalContainer?: HTMLElement | DocumentFragment;
  shownPluginModalInfo?: PluginModalInfo;
  pluginPopupContainer?: HTMLElement | DocumentFragment;
  shownPluginPopupInfo?: PluginPopupInfo;
  onPluginModalShow?: (modalInfo?: PluginModalInfo) => void;
  onPluginPopupShow?: (popupInfo?: PluginPopupInfo) => void;
};

export type ExternalPluginProps = Pick<CommonProps, "pluginProperty" | "pluginBaseUrl">;

export type Props = {
  mapRef?: RefObject<MapRef>;
  className?: string;
  sourceCode?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  autoResize?: "both" | "width-only" | "height-only";
  visible?: boolean;
  property?: any;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  iFrameProps?: PluginProps["iFrameProps"];
  onVisibilityChange?: (widgetId: string, v: boolean) => void;
  onClick?: () => void;
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
  onWidgetMove?: (widgetId: string, options: WidgetLocationOptions) => void;
} & CommonProps;

export default function Plugin({
  mapRef,
  onWidgetMove,
  className,
  sourceCode,
  pluginId,
  extensionId,
  extensionType,
  autoResize,
  visible,
  pluginModalContainer,
  shownPluginModalInfo,
  pluginPopupContainer,
  shownPluginPopupInfo,
  pluginBaseUrl = "/plugins",
  layer,
  widget,
  block,
  pluginProperty,
  iFrameProps,
  onVisibilityChange,
  onPluginModalShow,
  onPluginPopupShow,
  onClick,
  onRender,
  onResize,
}: Props): JSX.Element | null {
  const {
    skip,
    src,
    isMarshalable,
    uiVisible,
    modalVisible,
    popupVisible,
    externalRef,
    onPreInit,
    onDispose,
    exposed,
    onError,
  } = useHooks({
    mapRef,
    onWidgetMove,
    pluginId,
    extensionId,
    extensionType,
    pluginBaseUrl,
    visible,
    layer,
    widget,
    block,
    pluginProperty,
    shownPluginModalInfo,
    shownPluginPopupInfo,
    onVisibilityChange,
    onPluginModalShow,
    onPluginPopupShow,
    onRender,
    onResize,
  });

  return !skip && (src || sourceCode) ? (
    <P
      className={className}
      src={src}
      sourceCode={sourceCode}
      autoResize={autoResize}
      iFrameProps={iFrameProps}
      uiVisible={uiVisible}
      modalVisible={modalVisible}
      popupVisible={popupVisible}
      modalContainer={pluginModalContainer}
      popupContainer={pluginPopupContainer}
      externalRef={externalRef}
      isMarshalable={isMarshalable}
      exposed={exposed}
      onError={onError}
      onPreInit={onPreInit}
      onDispose={onDispose}
      onClick={onClick}
    />
  ) : null;
}
