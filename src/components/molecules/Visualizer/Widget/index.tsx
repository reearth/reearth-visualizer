import React, { ComponentType, useMemo } from "react";

import Plugin, { Widget as RawWidget, WidgetLayout, WidgetLocation } from "../Plugin";

import builtin from "./builtin";

export type { WidgetLayout } from "../Plugin";

export type Widget = Omit<RawWidget, "layout" | "extended"> & { extended?: boolean };

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  widget?: Widget;
  sceneProperty?: SP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
  widgetLayout?: WidgetLayout;
  widgetAlignSystemState?: AlignSystemState;
};

export type AlignSystemState = {
  editing: boolean;
};

export type ComponentProps<PP = any, SP = any> = Omit<Props<PP, SP>, "widget"> & {
  widget: RawWidget;
};

export type Component<PP = any, SP = any> = ComponentType<ComponentProps<PP, SP>>;

export default function WidgetComponent<PP = any, SP = any>({
  widget,
  pluginBaseUrl,
  widgetLayout,
  ...props
}: Props<PP, SP>) {
  const { align, location } = widgetLayout ?? {};
  const w = useMemo<RawWidget | undefined>(
    () =>
      widget
        ? {
            ...widget,
            extended: !widgetLayout
              ? undefined
              : {
                  horizontally: !!widget.extended && isHorizontal(widgetLayout.location),
                  vertically: !!widget.extended && isVertical(widgetLayout.location),
                },
            layout: align && location ? { align, location } : undefined,
          }
        : undefined,
    [widget, widgetLayout, align, location],
  );

  if (!w) return null;

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

function isHorizontal(l: WidgetLocation): boolean {
  return l.section === "center";
}

function isVertical(l: WidgetLocation): boolean {
  return l.area === "middle";
}
