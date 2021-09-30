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
  visible?: boolean;
  iFrameProps?: PluginProps["iFrameProps"];
  property?: any;
  pluginProperty?: any;
  pluginBaseUrl?: string;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
};

export default function Plugin({
  className,
  sourceCode,
  pluginId,
  extensionId,
  extensionType,
  iFrameProps,
  visible,
  pluginBaseUrl = "/plugins",
  layer,
  widget,
  block,
  pluginProperty,
}: Props): JSX.Element | null {
  const { skip, src, isMarshalable, onPreInit, onDispose, exposed, onError, onMessage } = useHooks({
    pluginId,
    extensionId,
    extensionType,
    pluginBaseUrl,
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
      filled={!!widget?.extended?.horizontally || !!widget?.extended?.vertically}
      iFrameProps={iFrameProps}
      canBeVisible={visible}
      isMarshalable={isMarshalable}
      exposed={exposed}
      onError={onError}
      onMessage={onMessage}
      onPreInit={onPreInit}
      onDispose={onDispose}
    />
  ) : null;
}
