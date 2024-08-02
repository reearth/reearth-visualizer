import { Item } from "@reearth/services/api/propertyApi/utils";

export type Position = "left" | "right";

export type Story = {
  id: string;
  title?: string;
  bgColor?: string;
  position: Position;
  pages: StoryPage[];
};

export type StoryPage = {
  id: string;
  title?: string;
  swipeable?: boolean;
  layerIds?: string[];
  propertyId?: string;
  property?: any;
  blocks: StoryBlock[];
};

export type StoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  extensionType?: "storyBlock";
  propertyId?: string;
  property?: any;
  propertyForPluginAPI?: any;
  propertyItemsForPluginBlock?: Item[];
};

export type PluginStoryBlock = Omit<
  StoryBlock,
  "propertyForPluginAPI" | "propertyItemsForPluginBlock"
>;

export type Field<V = any> = {
  type?: string;
  ui?: string;
  title?: string;
  description?: string;
  value?: V;
  choices?: string[];
};
