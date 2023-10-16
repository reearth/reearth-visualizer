import { Spacing } from "@reearth/beta/utils/value";

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
  propertySchema?: any;
  blocks: StoryBlock[];
};

export type StoryBlock<ValueType = any> = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: {
    title?: Field<string>;
    padding?: Field<Spacing>;
    gap?: Field<number>;
    value?: Field<ValueType>;
  };
  propertySchema?: any;
};

export type Field<V = any> = {
  type?: string;
  ui?: string;
  title?: string;
  description?: string;
  value?: V;
};
