import { Block } from "@reearth/app/features/Visualizer/Crust";
import { SceneMode } from "@reearth/app/types";
import {
  AssetsProperty as CoreAssetsProperty,
  AssetsCesiumProperty as CoreAssetsCesiumProperty,
  SceneProperty as CoreSceneProperty,
  ViewerProperty as CoreViewerProperty
} from "@reearth/core";

export interface Item {
  id: string;
  name: string;
  icon?: string;
}

export type BlockType = Item & Pick<Block, "pluginId" | "extensionId">;

export declare type ViewerProperty = Omit<CoreViewerProperty, "scene" | "assets"> & {
  scene?: Omit<CoreSceneProperty, "mode"> & {
    mode?: SceneMode;
  };
  assets?: Omit<CoreAssetsProperty, "cesium"> & {
    cesium?: CoreAssetsCesiumProperty & {
      global?: {
        ionAccessToken?: string;
      };
    };
  };
};
