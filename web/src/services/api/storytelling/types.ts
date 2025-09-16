import {
  CreateWorkspacePayload,
  PublishmentStatus
} from "@reearth/services/gql";

import type { Item } from "../property";

export type InstallableStoryBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: "StoryBlock";
};

export type InstalledStoryBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  name: string;
  description: string | undefined;
  icon?: string;
  property?: {
    id: string;
    items: Item[] | undefined;
  };
};

export type Block = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: {
    id: string;
    items: Item[] | undefined;
  };
};

export type Page = {
  id: string;
  title: string;
  swipeable: boolean;
  property: {
    id: string;
    items: Item[] | undefined;
  };
  blocks?: Block[];
  layersIds?: string[];
};
export enum Position {
  Left = "LEFT",
  Right = "RIGHT"
}
export type Story = {
  id: string;
  title?: string;
  bgColor?: string;
  publicTitle?: string;
  publicDescription?: string;
  publicImage?: string;
  isBasicAuthActive?: boolean;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
  publishmentStatus?: PublishmentStatus;
  panelPosition?: Position;
  alias: string;
  pages?: Page[];
  trackingId?: string; // Not supported yet
  enableGa?: boolean; // Not supported yet
};

export type Team = CreateWorkspacePayload["workspace"];
