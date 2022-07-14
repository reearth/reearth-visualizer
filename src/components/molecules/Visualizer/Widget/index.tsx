import { ComponentType, useCallback, useMemo } from "react";

import Plugin, {
  Widget as RawWidget,
  WidgetLayout,
  WidgetLocation,
  Props as PluginProps,
} from "../Plugin";

import builtin from "./builtin";

export type { WidgetLayout } from "../Plugin";

export type Widget = Omit<RawWidget, "layout" | "extended"> & { extended?: boolean };

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  widget: Widget;
  extended?: boolean;
  sceneProperty?: SP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
  layout?: WidgetLayout;
  editing?: boolean;
  iFrameProps?: PluginProps["iFrameProps"];
  onExtend?: (id: string, extended: boolean | undefined) => void;
};

export type ComponentProps<PP = any, SP = any> = Omit<Props<PP, SP>, "widget"> & {
  widget: RawWidget;
};

export type Component<PP = any, SP = any> = ComponentType<ComponentProps<PP, SP>>;

export default function WidgetComponent<PP = any, SP = any>({
  widget,
  extended,
  pluginBaseUrl,
  layout,
  iFrameProps,
  onExtend,
  ...props
}: Props<PP, SP>) {
  const { align, location } = layout ?? {};
  const horizontal = location ? isHorizontal(location) : false;
  const vertical = location ? isVertical(location) : false;
  const actualExtended = !!(extended ?? widget.extended);

  const w = useMemo<RawWidget | undefined>(
    () => ({
      ...widget,
      extended: {
        horizontally: actualExtended && horizontal,
        vertically: actualExtended && vertical,
      },
      layout: align && location ? { align, location } : undefined,
    }),
    [widget, actualExtended, horizontal, vertical, align, location],
  );

  const handleRender = useCallback<NonNullable<PluginProps["onRender"]>>(
    options => {
      onExtend?.(widget.id, options?.extended);
    },
    [widget.id, onExtend],
  );
  const handleResize = useCallback<NonNullable<PluginProps["onResize"]>>(
    (_width, _height, extended) => {
      onExtend?.(widget.id, extended);
    },
    [widget.id, onExtend],
  );

  if (!w) return null;

  const Builtin =
    w?.pluginId && w.extensionId ? builtin[`${w.pluginId}/${w.extensionId}`] : undefined;

  const autoResize = w?.extended?.vertically
    ? "width-only"
    : w?.extended?.horizontally
    ? "height-only"
    : "both";

  return Builtin ? (
    <Builtin {...props} widget={w} layout={layout} extended={extended} onExtend={onExtend} />
  ) : (
    <Plugin
      autoResize={autoResize}
      pluginId={w?.pluginId}
      extensionId={w?.extensionId}
      sourceCode={(w as any)?.__REEARTH_SOURCECODE} // for debugging
      extensionType="widget"
      visible
      pluginBaseUrl={pluginBaseUrl}
      property={props.pluginProperty}
      widget={w}
      iFrameProps={iFrameProps}
      onRender={handleRender}
      onResize={handleResize}
    />
  );
}

function isHorizontal(l: WidgetLocation): boolean {
  return l.section === "center";
}

function isVertical(l: WidgetLocation): boolean {
  return l.area === "middle";
}
