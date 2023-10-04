import { useCallback, useMemo, useState } from "react";

import { StoryPage } from "../types";

export type { StoryPage } from "../types";

export default ({
  page,
  onBlockCreate,
}: {
  page?: StoryPage;
  onBlockCreate?: (
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void> | undefined;
}) => {
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

  const [storyBlocks, setStoryBlocks] = useState(page?.blocks ?? []);

  const handleBlockOpen = useCallback(
    (index: number) => {
      if (openBlocksIndex === index) {
        setOpenBlocksIndex(undefined);
      } else {
        setOpenBlocksIndex(index);
      }
    },
    [openBlocksIndex],
  );

  const property = useMemo(() => page?.property, [page?.property]);

  const propertyId = useMemo(() => page?.propertyId, [page?.propertyId]);

  const padding = useMemo(() => property?.panel?.padding, [property?.panel?.padding]);

  const gap = useMemo(() => property?.panel?.gap, [property?.panel?.gap]);

  const title = useMemo(() => property?.title?.title, [property?.title?.title]);

  const titleId = useMemo(() => `${page?.id}/title`, [page?.id]);

  const handleBlockCreate = useCallback(
    (index: number) => (extensionId?: string | undefined, pluginId?: string | undefined) =>
      onBlockCreate?.(extensionId, pluginId, index),
    [onBlockCreate],
  );

  return {
    openBlocksIndex,
    titleId,
    title,
    propertyId,
    property,
    padding,
    gap,
    storyBlocks,
    setStoryBlocks,
    handleBlockOpen,
    handleBlockCreate,
  };
};
