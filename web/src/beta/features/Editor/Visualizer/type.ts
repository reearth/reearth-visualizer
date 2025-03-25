import { Block } from "@reearth/beta/features/Visualizer/Crust";
import { SceneMode } from "@reearth/beta/types";
import {
  ImageBasedLighting,
  LightProperty,
  ShadowProperty,
  ViewerProperty as CoreViewerProperty
} from "@reearth/core";

export interface Item {
  id: string;
  name: string;
  icon?: string;
}

export type BlockType = Item & Pick<Block, "pluginId" | "extensionId">;

export declare type ViewerProperty = {
  scene?: {
    backgroundColor?: string;
    mode?: SceneMode;
    verticalExaggeration?: number;
    verticalExaggerationRelativeHeight?: number;
    vr?: boolean;
    light?: LightProperty;
    shadow?: ShadowProperty;
    imageBasedLighting?: ImageBasedLighting;
  };
} & Omit<CoreViewerProperty, "scene">;
