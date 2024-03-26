import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useEditModeContext } from "../../shared/contexts/editModeContext";
import { STORY_PANEL_CONTENT_ELEMENT_ID } from "../constants";

export type { StoryPage } from "../hooks";
export { STORY_PANEL_CONTENT_ELEMENT_ID } from "../constants";

export default ({
  onBlockCreate,
  onBlockDelete,
}: {
  onBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onBlockDelete?: (pageId?: string | undefined, blockId?: string | undefined) => Promise<void>;
}) => {
  const editModeContext = useEditModeContext();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const [pageGap, setPageGap] = useState<number>();

  const disableSelection = useMemo(
    () => editModeContext?.disableSelection,
    [editModeContext?.disableSelection],
  );

  const handleBlockCreate = useCallback(
    (pageId: string) =>
      (
        extensionId?: string | undefined,
        pluginId?: string | undefined,
        index?: number | undefined,
      ) =>
        onBlockCreate?.(pageId, extensionId, pluginId, index),
    [onBlockCreate],
  );

  const handleBlockDelete = useCallback(
    (pageId: string) => (blockId?: string) => onBlockDelete?.(pageId, blockId),
    [onBlockDelete],
  );

  useLayoutEffect(() => {
    const pageWrapperElement = document.getElementById(STORY_PANEL_CONTENT_ELEMENT_ID);
    if (pageWrapperElement) setPageGap(pageWrapperElement.clientHeight - 40); // 40px is the height of the page title block
  }, [setPageGap]);

  useEffect(() => {
    const resizeCallback = () => {
      const pageWrapperElement = document.getElementById(STORY_PANEL_CONTENT_ELEMENT_ID);
      if (pageWrapperElement) setPageGap(pageWrapperElement.clientHeight - 40); // 40px is the height of the page title block
    };
    window.addEventListener("resize", resizeCallback);
    return () => window.removeEventListener("resize", resizeCallback);
  }, []);

  return {
    pageGap,
    scrollTimeoutRef,
    disableSelection,
    handleBlockCreate,
    handleBlockDelete,
  };
};
