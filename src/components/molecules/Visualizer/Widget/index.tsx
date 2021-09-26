import React, { ComponentType, useMemo } from "react";

import Plugin, { Widget, WidgetLayout } from "../Plugin";

import builtin from "./builtin";

export type { Widget, WidgetLayout } from "../Plugin";

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  widget?: Widget;
  sceneProperty?: SP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
  widgetLayout?: WidgetLayout;
};

export type Component<PP = any, SP = any> = ComponentType<Props<PP, SP>>;

export default function WidgetComponent<PP = any, SP = any>({
  widget,
  pluginBaseUrl,
  widgetLayout,
  ...props
}: Props<PP, SP>) {
  const { align, location } = widgetLayout ?? {};
  const w = useMemo<Widget | undefined>(
    () =>
      widget
        ? {
            ...widget,
            layout: align && location ? { align, location } : undefined,
          }
        : undefined,
    [widget, align, location],
  );

  const Builtin =
    w?.pluginId && w.extensionId ? builtin[`${w.pluginId}/${w.extensionId}`] : undefined;

  return Builtin ? (
    <Builtin {...props} widget={w} />
  ) : (
    <Plugin
      pluginId={w?.pluginId}
      extensionId={w?.extensionId}
      sourceCode={(w as any)?.__REEARTH_SOURCECODE} // for debugging
      extensionType="widget"
      visible
      pluginBaseUrl={pluginBaseUrl}
      property={props.pluginProperty}
      widget={w}
    />
  );
}
