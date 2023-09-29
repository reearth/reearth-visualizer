import { useCallback, useEffect, useMemo, useState } from "react";

import { Page } from "../types";

export type { Page } from "../types";

export default ({
  page,
  onBlockCreate,
}: {
  page?: Page;
  onBlockCreate?: (
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void> | undefined;
}) => {
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();
  const storyBlocks = useMemo(() => page?.blocks, [page?.blocks]);

  const [items, setItems] = useState(storyBlocks ? storyBlocks : []);

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

  const padding = useMemo(() => property.panel.padding, [property.panel.padding]);

  const gap = useMemo(() => property.panel.gap, [property.panel.gap]);

  const title = useMemo(() => property?.title?.title, [property.title.title]);

  const titleId = useMemo(() => `${page?.id}/title`, [page?.id]);

  const handleBlockCreate = useCallback(
    (index: number) => (extensionId?: string | undefined, pluginId?: string | undefined) =>
      onBlockCreate?.(extensionId, pluginId, index),
    [onBlockCreate],
  );

  useEffect(() => {
    storyBlocks && setItems(storyBlocks);
  }, [storyBlocks]);

  return {
    openBlocksIndex,
    titleId,
    title,
    propertyId,
    property,
    storyBlocks,
    padding,
    gap,
    items,
    setItems,
    handleBlockOpen,
    handleBlockCreate,
  };
};
