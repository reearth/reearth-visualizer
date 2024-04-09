import { useCallback, useEffect, useMemo, useState } from "react";

import { useEditModeContext } from "../../shared/contexts/editModeContext";
import { DEFAULT_STORY_PAGE_GAP, DEFAULT_STORY_PAGE_PADDING } from "../constants";
import { StoryPage } from "../types";
import { calculatePaddingValue } from "../utils";

export type { StoryPage } from "../types";

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
  const editModeContext = useEditModeContext();

  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();
  const [storyBlocks, setStoryBlocks] = useState(page?.blocks ?? []);

  const disableSelection = useMemo(
    () => editModeContext?.disableSelection,
    [editModeContext?.disableSelection],
  );

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
          DEFAULT_STORY_PAGE_PADDING,
          property?.panel?.padding?.value,
          isEditable,
        ),
      },
      gap: {
        ...property?.panel?.gap,
        value: property?.panel?.gap?.value ?? DEFAULT_STORY_PAGE_GAP,
      },
    }),
    [property?.panel, isEditable],
  );

  const titleProperty = useMemo(
    () => ({
      title: {
        title: property?.title?.title,
        color: property?.title?.color,
      },
      panel: { padding: property?.title?.padding },
    }),
    [property?.title],
  );

  const titleId = useMemo(() => `${page?.id}/title`, [page?.id]);

  const handleBlockCreate = useCallback(
    (index: number) => (extensionId?: string | undefined, pluginId?: string | undefined) =>
      onBlockCreate?.(extensionId, pluginId, index),
    [onBlockCreate],
  );

  return {
    openBlocksIndex,
    titleId,
    titleProperty,
    propertyId,
    property,
    panelSettings,
    storyBlocks,
    disableSelection,
    setStoryBlocks,
    handleBlockOpen,
    handleBlockCreate,
  };
};
