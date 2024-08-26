import { Block } from "@reearth/beta/features/Visualizer/Crust";

export interface Item {
  id: string;
  name: string;
  icon?: string;
}

export type BlockType = Item & Pick<Block, "pluginId" | "extensionId">;
