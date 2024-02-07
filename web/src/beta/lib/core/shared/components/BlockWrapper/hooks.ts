import { useCallback, useMemo, useState, MouseEvent } from "react";

import { Spacing } from "@reearth/beta/lib/core/mantle";
import useDoubleClick from "@reearth/beta/utils/use-double-click";

import { usePanelContext } from "../../../StoryPanel/context";
import { calculatePaddingValue } from "../../../StoryPanel/utils";

export const DEFAULT_BLOCK_PADDING: Spacing = { top: 0, bottom: 0, left: 0, right: 0 };

export default ({
  name,
  isSelected,
  property,
  isEditable,
  onClick,
  onBlockDoubleClick,
}: {
  name?: string | null;
  isSelected?: boolean;
  property?: any;
  isEditable?: boolean;
  onClick: (() => void) | undefined;
  onBlockDoubleClick: (() => void) | undefined;
}) => {
  const storyPanelContext = usePanelContext();
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const disableSelection = useMemo(
    () => storyPanelContext?.disableSelection,
    [storyPanelContext?.disableSelection],
  );

  const handleEditModeToggle = useCallback(
    (enable: boolean) => {
      storyPanelContext?.onSelectionDisable?.(enable);
      setEditMode?.(enable);
    },
    [storyPanelContext],
  );

  const handleSettingsToggle = useCallback(() => setShowSettings?.(s => !s), []);

  const title = useMemo(() => name ?? property?.title, [name, property?.title]);

  const handleBlockDoubleClick = useCallback(() => {
    if (isEditable && !storyPanelContext.disableSelection) {
      onBlockDoubleClick?.();
      handleEditModeToggle(true);
    }
  }, [isEditable, storyPanelContext, onBlockDoubleClick, handleEditModeToggle]);

  const [handleSingleClick, handleDoubleClick] = useDoubleClick(
    () => onClick?.(),
    () => handleBlockDoubleClick?.(),
  );

  const handleBlockClick = useCallback(
    (e: MouseEvent<Element>) => {
      e.stopPropagation();
      if ((showSettings && isSelected) || editMode) return;
      handleSingleClick();
    },
    [showSettings, isSelected, editMode, handleSingleClick],
  );

  const defaultSettings = useMemo(() => property?.default ?? property?.title, [property]);

  const groupId = useMemo(
    () => (property?.default ? "default" : property?.title ? "title" : undefined),
    [property],
  );

  const generalBlockSettings = useMemo(() => {
    if (!property?.panel) return undefined;
    return {
      padding: {
        ...property?.panel?.padding,
        value: calculatePaddingValue(
          DEFAULT_BLOCK_PADDING,
          property?.panel?.padding?.value,
          isEditable,
        ),
      },
    };
  }, [property?.panel, isEditable]);

  return {
    title,
    groupId,
    editMode,
    showSettings,
    defaultSettings,
    generalBlockSettings,
    disableSelection,
    handleEditModeToggle,
    handleSettingsToggle,
    handleBlockClick,
    handleDoubleClick,
  };
};
