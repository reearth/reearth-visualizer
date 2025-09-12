import type { Item } from "../property";

export type InstallableInfoboxBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: "InfoboxBlock";
};

export type InstalledInfoboxBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  name: string;
  description: string | undefined;
  icon?: string;
  property?: {
    id: string;
    items: Item[] | undefined;
  };
};
