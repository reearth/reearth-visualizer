import { WidgetLayout } from "../widget";

export enum PluginExtensionType {
  Block = "BLOCK",
  Infobox = "INFOBOX",
  Primitive = "PRIMITIVE",
  Visualizer = "VISUALIZER",
  Widget = "WIDGET"
}

export type Extension = {
  extensionId: string;
  pluginId: string;
  name: string;
  description: string;
  singleOnly?: boolean;
  type: PluginExtensionType;
  // visualizer?: string;
  widgetLayout?: WidgetLayout;
};

export type Plugin = {
  id: string;
  name: string;
  translatedName?: string;
  description?: string;
  translatedDescription?: string;
  extensions: Extension[];
  property?: unknown;
  author?: string;
};

export type MarketplacePlugin = {
  id: string;
  version: string;
  title?: string;
  author?: string;
};
