import { ReactNode, useCallback } from "react";

import type { Theme, Widget, WidgetLayout, WidgetLocationOptions } from "./types";
import useWidgetAlignSystem from "./useWidgetAlignSystem";
import WidgetComponent, { type Context } from "./Widget";
import WidgetAlignSystem, {
  WidgetAreaType,
  type Alignment,
  type Location,
  type WidgetAlignSystem as WidgetAlignSystemType,
  type WidgetLayoutConstraint,
  type WidgetProps as WasWidgetProps,
} from "./WidgetAlignSystem";

export type {
  Alignment,
  Location,
  WidgetAlignSystem,
  WidgetLayoutConstraint,
  WidgetArea,
  WidgetZone,
  WidgetSection,
  WidgetAreaType,
} from "./WidgetAlignSystem";

export type { Context, BuiltinWidgets } from "./Widget";
export { isBuiltinWidget } from "./Widget";

export type { Widget, InternalWidget, WidgetLocationOptions, WidgetAlignment } from "./types";

export type Props = {
  alignSystem?: WidgetAlignSystemType;
  selectedWidgetArea?: WidgetAreaType;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  editing?: boolean;
  isMobile?: boolean;
  theme?: Theme;
  isEditable?: boolean;
  isBuilt?: boolean;
  context?: Context;
  renderWidget?: (props: WidgetProps) => ReactNode;
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onAlignmentUpdate?: (location: Location, align: Alignment) => void;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
};

export type WidgetProps = {
  widget: Widget;
  editing: boolean;
  extended: boolean;
  layout: WidgetLayout;
  onExtend: (id: string, extended: boolean | undefined) => void;
  moveWidget: (widgetId: string, options: WidgetLocationOptions) => void;
  onVisibilityChange: (widgetId: string, v: boolean) => void;
};

export default function Widgets({
  alignSystem,
  selectedWidgetArea,
  editing,
  isMobile,
  layoutConstraint,
  theme,
  isEditable,
  isBuilt,
  context,
  renderWidget,
  onAlignmentUpdate,
  onWidgetLayoutUpdate,
  onWidgetAreaSelect,
}: Props): JSX.Element | null {
  const { overriddenAlignSystem, moveWidget, onVisibilityChange, invisibleWidgetIDs } =
    useWidgetAlignSystem({
      alignSystem,
    });

  const renderWidgetInternal = useCallback(
    ({ editing, extended, layout, widget, onExtend }: WasWidgetProps) => (
      <WidgetComponent
        widget={widget}
        editing={editing}
        extended={extended}
        layout={layout}
        theme={theme}
        isEditable={isEditable}
        isBuilt={isBuilt}
        context={context}
        renderWidget={widget2 =>
          renderWidget?.({
            widget: widget2,
            editing,
            extended,
            layout,
            onExtend,
            moveWidget,
            onVisibilityChange,
          })
        }
        onExtend={onExtend}
      />
    ),
    [context, isBuilt, isEditable, renderWidget, theme, moveWidget, onVisibilityChange],
  );

  return (
    <WidgetAlignSystem
      alignSystem={overriddenAlignSystem}
      selectedWidgetArea={selectedWidgetArea}
      invisibleWidgetIDs={invisibleWidgetIDs}
      editing={editing}
      isMobile={isMobile}
      layoutConstraint={layoutConstraint}
      theme={theme}
      renderWidget={renderWidgetInternal}
      onAlignmentUpdate={onAlignmentUpdate}
      onWidgetLayoutUpdate={onWidgetLayoutUpdate}
      onWidgetAreaSelect={onWidgetAreaSelect}
    />
  );
}
