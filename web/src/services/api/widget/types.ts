import { Item } from "../property";

export type WidgetLocation = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetLayout = {
  location: WidgetLocation;
  align: WidgetAlignment;
};

export type Widget<P = any> = {
  id: string;
  pluginId: string;
  extensionId: string;
  property?: P;
  propertyId?: string;
  title?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
  extended?: boolean;
  layout?: WidgetLayout;
};

export type InstallableWidget = {
  pluginId: string;
  extensionId: string;
  title: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
};

export type InstalledWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  enabled: boolean;
  extended: boolean;
  title: string;
  description: string | undefined;
  icon: string;
  property: {
    id: string;
    items: Item[] | undefined;
  };
};
