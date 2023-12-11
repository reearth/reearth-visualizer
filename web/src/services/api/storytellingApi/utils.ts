import { GetSceneQuery } from "@reearth/services/gql";

import { type Item, convert } from "../propertyApi/utils";

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
  Right = "RIGHT",
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
  publishmentStatus?: string;
  panelPosition?: Position;
  alias: string;
  pages?: Page[];
};

export const getStories = (rawScene?: GetSceneQuery) => {
  const scene = rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;
  return scene?.stories.map(s => {
    return {
      ...s,
      publishmentStatus: s.publishmentStatus,
      panelPosition: s.panelPosition,
      bgColor: s.bgColor,
      pages: s.pages.map(p => {
        return {
          ...p,
          property: {
            id: p.property?.id,
            items: convert(p.property, null),
          },
          blocks: p.blocks.map(b => {
            return {
              ...b,
              property: {
                id: b.property?.id,
                items: convert(b.property, null),
              },
            };
          }),
        };
      }),
    } as Story;
  });
};
