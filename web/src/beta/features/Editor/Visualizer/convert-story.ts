import { Story, StoryBlock, StoryPage } from "@reearth/beta/lib/core/StoryPanel/types";
import { Scene } from "@reearth/services/api/sceneApi";
import { StoryPage as GqlStoryPage, StoryBlock as GqlStoryBlock } from "@reearth/services/gql";

import { processProperty } from "./processNewProperty";

export const convertStory = (scene?: Scene, storyId?: string): Story | undefined => {
  const story = scene?.stories.find(s => s.id === storyId);
  const installedBlockNames = (scene?.plugins ?? [])
    .flatMap(p =>
      (p.plugin?.extensions ?? [])
        .filter(e => e.type === "StoryBlock")
        .map(e => ({ [e.extensionId]: e.translatedName ?? e.name }))
        .filter((e): e is { [key: string]: string } => !!e),
    )
    .reduce((result, obj) => ({ ...result, ...obj }), {});

  if (!story) return undefined;

  const storyPages = (pages: GqlStoryPage[]): StoryPage[] =>
    pages.map(p => ({
      id: p.id,
      title: p.title,
      propertyId: p.propertyId,
      layerIds: p.layersIds,
      property: processProperty(undefined, p.property),
      blocks: storyBlocks(p.blocks),
    }));
  const storyBlocks = (blocks: GqlStoryBlock[]): StoryBlock[] =>
    blocks.map(b => ({
      id: b.id,
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      name: installedBlockNames?.[b.extensionId] ?? "Story Block",
      propertyId: b.property?.id,
      property: processProperty(undefined, b.property),
    }));

  return {
    id: story.id,
    title: story.title,
    position: story.panelPosition === "RIGHT" ? "right" : "left",
    bgColor: story.bgColor || "#f1f1f1",
    pages: storyPages(story.pages),
  };
};
