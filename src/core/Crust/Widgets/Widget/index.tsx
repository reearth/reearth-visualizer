import { ComponentType, ReactNode, useMemo } from "react";

import type { TickEvent } from "@reearth/core/Map";

import builtin, { isBuiltinWidget } from "./builtin";
import type {
  Theme,
  FlyToDestination,
  Widget,
  WidgetLayout,
  WidgetLocation,
  LookAtDestination,
  Clock,
  Camera,
  InternalWidget,
} from "./types";

export type { WidgetLayout } from "../types";
export { isBuiltinWidget, type BuiltinWidgets } from "./builtin";

export type Props = {
  widget: InternalWidget;
  extended?: boolean;
  editing?: boolean;
  layout?: WidgetLayout;
  theme?: Theme;
  isEditable?: boolean;
  isBuilt?: boolean;
  context?: Context;
  onExtend?: (id: string, extended: boolean | undefined) => void;
  renderWidget?: (w: Widget) => ReactNode;
};

export type Context = {
  clock?: Clock;
  camera?: Camera;
  initialCamera?: Camera;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  is2d?: boolean;
  onFlyTo?: (target: string | FlyToDestination, options?: { duration?: number }) => void;
  onLookAt?: (camera: LookAtDestination, options?: { duration?: number }) => void;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    options?: { reason?: string },
  ) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onTimeChange?: (time: Date) => void;
  onTick?: TickEvent;
  removeTickEventListener?: TickEvent;
  onZoomIn?: (amount: number) => void;
  onZoomOut?: (amount: number) => void;
  onCameraOrbit?: (radians: number) => void;
  onCameraRotateRight?: (radians: number) => void;
  findPhotooverlayLayer?: (
    id: string,
  ) => { title?: string; lat: number; lng: number; height: number } | undefined;
};

export type ComponentProps<P = any> = Omit<Props, "widget" | "renderWidget"> & {
  widget: Widget<P>;
};

export type Component = ComponentType<ComponentProps>;

export default function WidgetComponent({
  widget,
  editing,
  renderWidget,
  ...props
}: Props): JSX.Element | null {
  const { align, location } = props.layout ?? {};
  const horizontal = location ? isHorizontal(location) : false;
  const vertical = location ? isVertical(location) : false;
  const actualExtended = !!(props.extended ?? widget.extended);

  const w = useMemo<Widget | undefined>(
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

  if (!w) return null;

  const builtinWidgetId = `${w.pluginId}/${w.extensionId}`;
  const Builtin = isBuiltinWidget(builtinWidgetId) ? builtin[builtinWidgetId] : undefined;

  return Builtin ? (
    <div
      style={{
        pointerEvents: editing ? "none" : "auto",
      }}>
      <Builtin {...props} editing={editing} widget={w} />
    </div>
  ) : (
    <>{renderWidget?.(w)}</>
  );
}

function isHorizontal(l: WidgetLocation): boolean {
  return l.section === "center";
}

function isVertical(l: WidgetLocation): boolean {
  return l.area === "middle";
}
