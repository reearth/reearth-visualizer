import {
  Story,
  StoryBlock,
  StoryPage
} from "@reearth/app/features/Visualizer/Crust/StoryPanel/types";
import { convert } from "@reearth/services/api/property/utils";
import type { Scene } from "@reearth/services/api/scene";
import {
  StoryPage as GqlStoryPage,
  StoryBlock as GqlStoryBlock
} from "@reearth/services/gql";

import { processProperty } from "./convert";
import { processProperty as processNewProperty } from "./processNewProperty";

export const convertStory = (
  scene?: Scene,
  storyId?: string
): Story | undefined => {
  const story = scene?.stories.find((s) => s.id === storyId);
  const installedBlockNames = (scene?.plugins ?? [])
    .flatMap((p) =>
      (p.plugin?.extensions ?? [])
        .filter((e) => e.type === "StoryBlock")
        .map((e) => ({ [e.extensionId]: e.translatedName ?? e.name }))
        .filter((e): e is Record<string, string> => !!e)
    )
    .reduce((result, obj) => Object.assign(result, obj), {});

  if (!story) return undefined;

  const storyPages = (pages: GqlStoryPage[]): StoryPage[] =>
    pages.map((p) => ({
      id: p.id,
      title: p.title,
      propertyId: p.propertyId,
      layerIds: p.layersIds,
      property: processProperty(undefined, p.property),
      blocks: storyBlocks(p.blocks)
    }));
  const storyBlocks = (blocks: GqlStoryBlock[]): StoryBlock[] =>
    blocks.map((b) => ({
      id: b.id,
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      extensionType: "storyBlock",
      name: installedBlockNames?.[b.extensionId] ?? "Story Block",
      propertyId: b.property?.id,
      property: processNewProperty(undefined, b.property),
      propertyForPluginAPI: processProperty(b.property),
      propertyItemsForPluginBlock: convert(b.property)
    }));

  return {
    id: story.id,
    title: story.title,
    position: story.panelPosition === "RIGHT" ? "right" : "left",
    bgColor: story.bgColor || "#f1f1f1",
    pages: storyPages(story.pages)
  };
};
