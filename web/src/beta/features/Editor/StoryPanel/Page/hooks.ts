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
  const { useInstalledStoryBlocksQuery, useCreateStoryBlock } = useStorytellingAPI();

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

  return { installedStoryBlocks, handleStoryBlockCreate };
};
