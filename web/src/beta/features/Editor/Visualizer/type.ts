import { Item } from "@reearth/beta/components/ContentPicker";
import { Block } from "@reearth/beta/features/Visualizer/Crust";

export type BlockType = Item & Pick<Block, "pluginId" | "extensionId">;
