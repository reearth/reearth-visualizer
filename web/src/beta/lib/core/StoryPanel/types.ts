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
  property?: any;
  blocks: StoryBlock[];
};

export type StoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: any;
};

export type Field<V = any> = {
  type?: string;
  ui?: string;
  title?: string;
  description?: string;
  value?: V;
};
