import { useCallback, useMemo, useState } from "react";

import { Page } from "../types";

export default ({ page }: { page?: Page; property?: any }) => {
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

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

  const storyBlocks = useMemo(() => page?.blocks, [page?.blocks]);

  const title = useMemo(() => property?.title?.title, [property]);

  const titleId = useMemo(() => `${page?.id}/title`, [page?.id]);

  return {
    openBlocksIndex,
    titleId,
    title,
    propertyId,
    property,
    storyBlocks,
    handleBlockOpen,
  };
};
