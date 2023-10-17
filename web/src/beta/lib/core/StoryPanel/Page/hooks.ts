import { useCallback, useEffect, useMemo, useState } from "react";

import { Spacing } from "../../mantle";
import { StoryPage } from "../types";
import { calculatePaddingValue } from "../utils";

export type { StoryPage } from "../types";

export const DEFAULT_PAGE_GAP = 2;
export const DEFAULT_PAGE_PADDING: Spacing = { top: 4, bottom: 4, left: 4, right: 4 };

export default ({
  page,
  isEditable,
  onBlockCreate,
}: {
  page?: StoryPage;
  isEditable?: boolean;
  onBlockCreate?: (
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void> | undefined;
}) => {
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

  const [storyBlocks, setStoryBlocks] = useState(page?.blocks ?? []);

  useEffect(() => page?.blocks && setStoryBlocks(page.blocks), [page?.blocks]);

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

  const panelSettings = useMemo(
    () => ({
      padding: {
        ...property?.panel?.padding,
        value: calculatePaddingValue(
          DEFAULT_PAGE_PADDING,
          property?.panel?.padding?.value,
          isEditable,
        ),
      },
      gap: property?.panel?.gap ?? DEFAULT_PAGE_GAP,
    }),
    [property?.panel, isEditable],
  );

  const title = useMemo(() => property?.title, [property?.title]);

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
    panelSettings,
    storyBlocks,
    setStoryBlocks,
    handleBlockOpen,
    handleBlockCreate,
  };
};
