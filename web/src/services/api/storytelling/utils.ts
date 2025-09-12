import { GetSceneQuery, PluginExtensionType } from "@reearth/services/gql";

import { convert } from "../property/utils";

import { InstallableStoryBlock, InstalledStoryBlock, Story } from "./types";

export const getStories = (rawScene?: GetSceneQuery) => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;
  return scene?.stories.map((s) => {
    return {
      ...s,
      publishmentStatus: s.publishmentStatus,
      panelPosition: s.panelPosition,
      bgColor: s.bgColor,
      pages: s.pages.map((p) => {
        return {
          ...p,
          property: {
            id: p.property?.id,
            items: convert(p.property, null)
          },
          blocks: p.blocks.map((b) => {
            return {
              ...b,
              property: {
                id: b.property?.id,
                items: convert(b.property, null)
              }
            };
          })
        };
      })
    } as Story;
  });
};

export const getInstallableStoryBlocks = (rawScene?: GetSceneQuery) => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;
  return scene?.plugins
    .map((p) => {
      const plugin = p.plugin;
      return plugin?.extensions
        .filter((e) => e.type === PluginExtensionType.StoryBlock)
        .map((e): InstallableStoryBlock => {
          return {
            name: e.translatedName ?? e.name,
            description: e.translatedDescription ?? e.description,
            pluginId: plugin.id,
            extensionId: e.extensionId,
            icon: e.icon,
            singleOnly: !!e.singleOnly,
            type: "StoryBlock"
          };
        })
        .filter((sb): sb is InstallableStoryBlock => !!sb);
    })
    .reduce<InstallableStoryBlock[]>((a, b) => (b ? [...a, ...b] : a), []);
};

export const getInstalledStoryBlocks = (
  rawScene?: GetSceneQuery,
  storyId?: string,
  pageId?: string
): InstalledStoryBlock[] | undefined => {
  if (!rawScene?.node || !storyId || !pageId) return;
  const scene =
    rawScene.node.__typename === "Scene" ? rawScene.node : undefined;

  const page = scene?.stories
    .find((s) => s.id === storyId)
    ?.pages.find((p) => p.id === pageId);

  const installableStoryBlocks = getInstallableStoryBlocks(rawScene);

  return page?.blocks.map((b) => {
    const block = installableStoryBlocks?.find(
      (isb) => isb.extensionId === b.extensionId
    );

    return {
      id: b.id,
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      name: block?.name ?? "Story Block",
      description: block?.description,
      icon: block?.icon,
      property: {
        id: b.property?.id ?? "",
        items: convert(b.property, null)
      }
    };
  });
};
