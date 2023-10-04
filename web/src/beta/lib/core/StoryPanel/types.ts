export type Story = {
  id: string;
  title?: string;
  pages: StoryPage[];
};

export type StoryPage = {
  id: string;
  title?: string;
  swipeable?: boolean;
  propertyId?: string;
  property?: unknown;
  blocks: StoryBlock[];
};

export type StoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: unknown;
};
