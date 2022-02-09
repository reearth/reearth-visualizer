import React from "react";

import P, { Props as PluginProps } from "@reearth/components/atoms/Plugin";

import useHooks from "./hooks";
import type { Layer, Widget, Block } from "./types";

export type {
  Layer,
  Block,
  Widget,
  WidgetLayout,
  InfoboxProperty,
  WidgetLocation,
  WidgetAlignment,
} from "./types";
export { Provider, useContext } from "./context";
export type { Props as ProviderProps, Context } from "./context";

export type Props = {
  className?: string;
  sourceCode?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  autoResize?: "both" | "width-only" | "height-only";
  visible?: boolean;
  iFrameProps?: PluginProps["iFrameProps"];
  property?: any;
  pluginProperty?: any;
  pluginBaseUrl?: string;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  onClick?: () => void;
};

export default function Plugin({
  className,
  sourceCode,
  pluginId,
  extensionId,
  extensionType,
  autoResize,
  iFrameProps,
  visible,
  pluginBaseUrl = "/plugins",
  layer,
  widget,
  block,
  pluginProperty,
  onClick,
}: Props): JSX.Element | null {
  const {
    skip,
    src,
    isMarshalable,
    actualAutoResize,
    onPreInit,
    onDispose,
    exposed,
    onError,
    onMessage,
  } = useHooks({
    pluginId,
    extensionId,
    extensionType,
    pluginBaseUrl,
    autoResize,
    layer,
    widget,
    block,
    pluginProperty,
  });

  return !skip && (src || sourceCode) ? (
    <P
      className={className}
      src={src}
      sourceCode={sourceCode}
      autoResize={actualAutoResize}
      iFrameProps={iFrameProps}
      canBeVisible={visible}
      isMarshalable={isMarshalable}
      exposed={exposed}
      onError={onError}
      onMessage={onMessage}
      onPreInit={onPreInit}
      onDispose={onDispose}
      onClick={onClick}
    />
  ) : null;
}
