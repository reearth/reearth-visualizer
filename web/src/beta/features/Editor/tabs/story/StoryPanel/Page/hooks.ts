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
  const { useInstalledStoryBlocksQuery } = useStorytellingAPI();

  const { installedStoryBlocks } = useInstalledStoryBlocksQuery({
    sceneId,
    lang: undefined,
    storyId,
    pageId,
  });

  return { installedStoryBlocks };
};
