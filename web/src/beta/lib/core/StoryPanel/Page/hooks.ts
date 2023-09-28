import { useCallback, useEffect, useMemo, useState } from "react";

import type { Page } from "../hooks";

export type { Page } from "../hooks";

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
  const storyBlocks = useMemo(() => page?.blocks, [page?.blocks]);

  const [items, setItems] = useState(storyBlocks ? storyBlocks : []);
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

  const propertyItems = useMemo(() => page?.property.items, [page?.property]);

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

  const titleProperty = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "title"),
    [propertyItems],
  );

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
    titleProperty,
    propertyItems,
    storyBlocks,
    items,
    setItems,
    handleBlockOpen,
    handleBlockCreate,
  };
};
