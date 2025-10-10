import { DeviceType } from "@reearth/app/utils/device";

import { Item } from "../property";

export type WidgetQueryProps = {
  sceneId?: string;
  type: DeviceType;
};

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
