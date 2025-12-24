import { useEditModeContext } from "@reearth/app/features/Visualizer/shared/contexts/editModeContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { STORY_PANEL_CONTENT_ELEMENT_ID } from "../constants";

export type { StoryPage } from "../hooks";
export { STORY_PANEL_CONTENT_ELEMENT_ID } from "../constants";

export default ({
  onBlockCreate,
  onBlockDelete
}: {
  onBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined
  ) => Promise<void>;
  onBlockDelete?: (
    pageId?: string | undefined,
    blockId?: string | undefined
  ) => Promise<void>;
}) => {
  const editModeContext = useEditModeContext();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const [pageGap, setPageGap] = useState<number>();

  const disableSelection = useMemo(
    () => editModeContext?.disableSelection,
    [editModeContext?.disableSelection]
  );

  const handleBlockCreate = useCallback(
    (pageId: string) =>
      (
        extensionId?: string | undefined,
        pluginId?: string | undefined,
        index?: number | undefined
      ) =>
        onBlockCreate?.(pageId, extensionId, pluginId, index),
    [onBlockCreate]
  );

  const handleBlockDelete = useCallback(
    (pageId: string) => (blockId?: string) => onBlockDelete?.(pageId, blockId),
    [onBlockDelete]
  );

  useEffect(() => {
    const pageWrapperElement = document.getElementById(
      STORY_PANEL_CONTENT_ELEMENT_ID
    );

    if (!pageWrapperElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { height } = entry.contentRect;
      setPageGap(height - 40); // 40px is the height of the page title block
    });

    resizeObserver.observe(pageWrapperElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return {
    pageGap,
    scrollTimeoutRef,
    disableSelection,
    handleBlockCreate,
    handleBlockDelete
  };
};
