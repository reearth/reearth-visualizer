export type { Camera, FlyToDestination, LookAtDestination, Theme, Clock } from "../types";

export type InternalWidget<P = any> = Omit<Widget<P>, "layout" | "extended"> & {
  extended?: boolean;
};

export type Widget<P = any> = {
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
