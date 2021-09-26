import React, { CSSProperties } from "react";

import P, { Props as PluginProps } from "@reearth/components/atoms/Plugin";
import { Primitive, Widget, Block, WidgetLocation, WidgetAlignment } from "@reearth/plugin";

import useHooks from "./hooks";

export type { Primitive, Block, Widget, WidgetLocation, WidgetAlignment } from "@reearth/plugin";

export type WidgetLayout = {
  floating: boolean;
  location?: WidgetLocation;
  align?: WidgetAlignment;
};

export type Props = {
  className?: string;
  style?: CSSProperties;
  sourceCode?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  visible?: boolean;
  iFrameProps?: PluginProps["iFrameProps"];
  property?: any;
  sceneProperty?: any;
  pluginBaseUrl?: string;
  primitive?: Primitive;
  widget?: Widget;
  block?: Block;
  widgetLayout?: WidgetLayout; // TODO
};

export default function Plugin({
  className,
  style,
  sourceCode,
  pluginId,
  extensionId,
  extensionType,
  iFrameProps,
  property,
  visible,
  pluginBaseUrl = "/plugins",
  primitive,
  widget,
  block,
  sceneProperty,
}: Props): JSX.Element | null {
  const { skip, src, exposed, isMarshalable, staticExposed, handleError, handleMessage } = useHooks(
    {
      pluginId,
      extensionId,
      sourceCode,
      extensionType,
      property,
      pluginBaseUrl,
      primitive,
      widget,
      block,
      sceneProperty,
    },
  );

  return !skip && (src || sourceCode) ? (
    <P
      className={className}
      style={style}
      src={src}
      sourceCode={sourceCode}
      iFrameProps={iFrameProps}
      canBeVisible={visible}
      exposed={exposed}
      isMarshalable={isMarshalable}
      staticExposed={staticExposed}
      onError={handleError}
      onMessage={handleMessage}
    />
  ) : null;
}
