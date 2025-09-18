export type { Camera, Theme, Clock } from "../types";
export type { FlyToDestination, LookAtDestination } from "@reearth/core";

// Base widget property structure - flexible to accommodate various widget types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WidgetProperty = Record<string, any>;

export type InternalWidget<P = WidgetProperty> = Omit<Widget<P>, "layout" | "extended"> & {
  extended?: boolean;
};

export type Widget<P = WidgetProperty> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
  extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  layout?: WidgetLayout;
};

export type WidgetLayout = {
  location: WidgetLocation;
  align?: WidgetAlignment;
};

export type WidgetLocation = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetLocationOptions = WidgetLocation & {
  method?: "insert" | "append";
};
