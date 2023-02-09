import { Alignment } from "react-align";

import type { InternalWidget, WidgetAlignment, WidgetLocation } from "../types";

export type { Alignment } from "react-align";

export type { Theme, Widget, InternalWidget, WidgetAlignment, WidgetLocation } from "../types";

export type Location = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAreaPadding = { top: number; bottom: number; left: number; right: number };

export type WidgetArea = {
  align?: Alignment;
  padding?: WidgetAreaPadding;
  widgets?: InternalWidget[];
  gap?: number;
  centered?: boolean;
  background?: string;
};

export type WidgetSection = {
  top?: WidgetArea;
  middle?: WidgetArea;
  bottom?: WidgetArea;
};

export type WidgetZone = {
  left?: WidgetSection;
  center?: WidgetSection;
  right?: WidgetSection;
};

export type WidgetAlignSystem = {
  outer?: WidgetZone;
  inner?: WidgetZone;
};

export type WidgetLayout = {
  location: WidgetLocation;
  align: WidgetAlignment;
};

export type WidgetLayoutConstraint = {
  extendable?: {
    horizontally?: boolean;
    vertically?: boolean;
  };
};

export type WidgetProps = {
  widget: InternalWidget;
  layout: WidgetLayout;
  extended?: boolean;
  editing: boolean;
  onExtend: (id: string, extended: boolean | undefined) => void;
};
