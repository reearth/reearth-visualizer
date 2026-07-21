import type { Layer } from "@reearth/core";
import { type RefObject, type JSX } from "react";

import type { InfoboxBlock as Block } from "../../Infobox/types";
import type { MapRef } from "../../types";
import type { Widget } from "../../Widgets";
import PluginFrame, { type Props as PluginFrameProps } from "../PluginFrame";

import usePluginInstance from "./hooks/usePluginInstance";
import type { PluginModalInfo } from "./ModalContainer";
import type { PluginPopupInfo } from "./PopupContainer";

export {
  default as PopupContainer,
  type PluginPopupInfo
} from "./PopupContainer";
export {
  default as ModalContainer,
  type PluginModalInfo
} from "./ModalContainer";

export type CommonProps = {
  pluginProperty?: unknown; // Taken from Visualizer
  pluginBaseUrl?: string; // Taken from Visualizer
  pluginModalContainer?: HTMLElement | DocumentFragment | null;
  shownPluginModalInfo?: PluginModalInfo;
  pluginPopupContainer?: HTMLElement | DocumentFragment | null;
  shownPluginPopupInfo?: PluginPopupInfo;
  onPluginModalShow?: (modalInfo?: PluginModalInfo) => void;
  onPluginPopupShow?: (popupInfo?: PluginPopupInfo) => void;
};

export type ExternalPluginProps = Pick<
  CommonProps,
  "pluginProperty" | "pluginBaseUrl"
>;

export type Props = {
  mapRef?: RefObject<MapRef | null>;
  className?: string;
  sourceCode?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  autoResize?: "both" | "width-only" | "height-only";
  visible?: boolean;
  property?: unknown;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  iFrameProps?: PluginFrameProps["iFrameProps"];
  onVisibilityChange?: (widgetId: string, v: boolean) => void;
  onClick?: () => void;
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
} & CommonProps;

export default function Plugin({
  mapRef,
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
  onResize
}: Props): JSX.Element | null {
  const {
    skip,
    src,
    isMarshalable,
    uiVisible,
    modalVisible,
    popupVisible,
    externalRef,
    uiContainerRef,
    renderKey,
    pluginContext,
    onError
  } = usePluginInstance({
    mapRef,
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
    onResize
  });

  return !skip && (src || sourceCode) && pluginContext ? (
    <PluginFrame
      className={className}
      src={src}
      key={renderKey}
      sourceCode={sourceCode}
      autoResize={autoResize}
      iFrameProps={iFrameProps}
      uiVisible={uiVisible}
      modalVisible={modalVisible}
      popupVisible={popupVisible}
      modalContainer={pluginModalContainer}
      popupContainer={pluginPopupContainer}
      externalRef={externalRef}
      uiContainerRef={uiContainerRef}
      isMarshalable={isMarshalable}
      pluginContext={pluginContext}
      onError={onError}
      onClick={onClick}
    />
  ) : null;
}
