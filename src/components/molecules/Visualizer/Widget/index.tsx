import type * as CSS from "csstype";
import { ComponentType, useCallback, useMemo } from "react";

import { Viewport } from "../hooks";
import Plugin, {
  Widget as RawWidget,
  WidgetLayout,
  WidgetLocation,
  Props as PluginProps,
  CommonProps as PluginCommonProps,
} from "../Plugin";

import builtin, { isBuiltinWidget } from "./builtin";

export type { WidgetLayout } from "../Plugin";

export type Widget = Omit<RawWidget, "layout" | "extended"> & { extended?: boolean };

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  widget: Widget;
  extended?: boolean;
  sceneProperty?: SP;
  pluginProperty?: PP;
  layout?: WidgetLayout;
  editing?: boolean;
  viewport?: Viewport;
  onExtend?: (id: string, extended: boolean | undefined) => void;
} & PluginCommonProps;

export type ComponentProps<PP = any, SP = any> = Omit<Props<PP, SP>, "widget" | "viewport"> & {
  widget: RawWidget;
};

export type Component<PP = any, SP = any> = ComponentType<ComponentProps<PP, SP>>;

export default function WidgetComponent<PP = any, SP = any>({
  widget,
  extended,
  pluginBaseUrl,
  pluginProperty,
  layout,
  onExtend,
  editing,
  viewport,
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

  const iFrameProps = useMemo<{ style: CSS.Properties }>(
    () => ({
      style: { pointerEvents: editing ? "none" : "auto" },
    }),
    [editing],
  );

  const BuiltinStyle = useMemo<CSS.Properties>(
    () => ({
      pointerEvents: editing ? "none" : "auto",
    }),
    [editing],
  );

  if (!w) return null;

  const builtinWidgetId = `${w.pluginId}/${w.extensionId}`;
  const Builtin = isBuiltinWidget(builtinWidgetId) ? builtin[builtinWidgetId] : undefined;

  const autoResize = w?.extended?.vertically
    ? "width-only"
    : w?.extended?.horizontally
    ? "height-only"
    : "both";

  return viewport ? (
    Builtin ? (
      <div style={BuiltinStyle}>
        <Builtin {...props} widget={w} layout={layout} extended={extended} onExtend={onExtend} />
      </div>
    ) : (
      <Plugin
        autoResize={autoResize}
        pluginId={w?.pluginId}
        extensionId={w?.extensionId}
        sourceCode={(w as any)?.__REEARTH_SOURCECODE} // for debugging
        extensionType="widget"
        visible
        pluginBaseUrl={pluginBaseUrl}
        property={pluginProperty}
        widget={w}
        iFrameProps={iFrameProps}
        onRender={handleRender}
        onResize={handleResize}
        {...props}
      />
    )
  ) : null;
}

function isHorizontal(l: WidgetLocation): boolean {
  return l.section === "center";
}

function isVertical(l: WidgetLocation): boolean {
  return l.area === "middle";
}
