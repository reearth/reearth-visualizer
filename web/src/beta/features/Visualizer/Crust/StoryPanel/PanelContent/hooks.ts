import { useEditModeContext } from "@reearth/beta/features/Visualizer/shared/contexts/editModeContext";
import {
  useCallback,
  useMemo,
  useRef,
} from "react";


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
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

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

  return {
    scrollTimeoutRef,
    disableSelection,
    handleBlockCreate,
    handleBlockDelete
  };
};
