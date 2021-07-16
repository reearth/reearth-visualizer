export type PublishedData = {
  schemaVersion: number;
  id: string;
  publishedAt: string;
  property: any;
  plugins: Plugin[];
  layers: Layer[];
  widgets: Widget[];
};

export type Plugin = {};

export type Layer = {
  id: string;
  name?: string;
  pluginId: string;
  extensionId: string;
  property: any;
  infobox?: {
    fields: Block[];
    property: any;
  } | null;
};

export type Block = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: any;
};

export type Widget = {
  pluginId: string;
  extensionId: string;
  property: any;
};
