import type { Item } from "@reearth/services/api/property";

export type Position = "left" | "right";

export type Story = {
  id: string;
  title?: string;
  bgColor?: string;
  position: Position;
  pages: StoryPage[];
};

// Story panel specific Field type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoryField<V = any> = {
  type?: string;
  ui?: string;
  title?: string;
  description?: string;
  value?: V;
  choices?: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoryPropertyValue = Record<string, any>;

export type StoryPageProperty = Record<string, StoryPropertyValue>;
export type StoryPage = {
  id: string;
  title?: string;
  swipeable?: boolean;
  layerIds?: string[];
  propertyId?: string;
  property?: StoryPageProperty;
  blocks: StoryBlock[];
};

export type StoryBlockProperty = Record<string, StoryPropertyValue>;
export type StoryBlockPropertyForPluginAPI = Record<string, unknown>;

export type StoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  extensionType?: "storyBlock";
  propertyId?: string;
  property?: StoryBlockProperty;
  propertyForPluginAPI?: StoryBlockPropertyForPluginAPI;
  propertyItemsForPluginBlock?: Item[];
};

export type PluginStoryBlock = Omit<
  StoryBlock,
  "propertyForPluginAPI" | "propertyItemsForPluginBlock"
>;

// Generic field type alias for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Field<V = any> = StoryField<V>;
