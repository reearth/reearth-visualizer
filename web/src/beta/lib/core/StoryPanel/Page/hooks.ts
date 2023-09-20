import { useCallback, useMemo, useState } from "react";

import type { Item } from "@reearth/services/api/propertyApi/utils";

export default ({ pageId, propertyItems }: { pageId?: string; propertyItems?: Item[] }) => {
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

  const titleProperty = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "title"),
    [propertyItems],
  );

  const titleId = useMemo(() => `${pageId}/title`, [pageId]);

  return {
    openBlocksIndex,
    titleId,
    titleProperty,
    handleBlockOpen,
  };
};
