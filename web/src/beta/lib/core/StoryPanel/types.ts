export type Story = {
  id: string;
  title?: string;
  pages: Page[];
};

export type Page = {
  id: string;
  title?: string;
  swipeable?: boolean;
  propertyId: string;
  property: any;
  blocks: Block[];
};

export type Block = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
  property: any;
};
