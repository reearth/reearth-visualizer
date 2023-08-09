import { useCallback } from "react";

import useStorytellingAPI from "@reearth/services/api/storytellingApi";

export default ({
  sceneId,
  storyId,
  pageId,
}: {
  sceneId?: string;
  storyId?: string;
  pageId?: string;
}) => {
  const { useInstalledStoryBlocksQuery, useCreateStoryBlock, useDeleteStoryBlock } =
    useStorytellingAPI();

  const { installedStoryBlocks } = useInstalledStoryBlocksQuery({
    sceneId,
    lang: undefined,
    storyId,
    pageId,
  });

  const handleStoryBlockCreate = useCallback(
    async (extensionId?: string, pluginId?: string) => {
      if (!extensionId || !pluginId || !storyId || !pageId) return;
      await useCreateStoryBlock({
        pluginId,
        extensionId,
        storyId,
        pageId,
      });
    },
    [storyId, pageId, useCreateStoryBlock],
  );

  const handleStoryBlockDelete = useCallback(
    async (blockId?: string) => {
      if (!blockId || !storyId || !pageId) return;
      await useDeleteStoryBlock({ blockId, pageId, storyId });
    },
    [storyId, pageId, useDeleteStoryBlock],
  );

  return { installedStoryBlocks, handleStoryBlockCreate, handleStoryBlockDelete };
};
