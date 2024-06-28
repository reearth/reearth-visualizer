import { useCallback, useMemo, useState, MouseEvent, useEffect } from "react";

import useDoubleClick from "@reearth/beta/utils/use-double-click";
import { Spacing } from "@reearth/core";

import { calculatePaddingValue } from "../../../Crust/StoryPanel/utils";
import { useEditModeContext } from "../../contexts/editModeContext";

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
  const editModeContext = useEditModeContext();

  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Close settings when block becomes not editable
  useEffect(() => {
    if (!isEditable && editMode) {
      setEditMode(false);
    }
  }, [isEditable, editMode]);

  const disableSelection = useMemo(
    () => editModeContext?.disableSelection,
    [editModeContext?.disableSelection],
  );

  const handleEditModeToggle = useCallback(
    (enable: boolean) => {
      editModeContext?.onSelectionDisable?.(enable);
      setEditMode?.(enable);
    },
    [editModeContext],
  );

  useEffect(
    () => () => {
      // This is necessary to prevent the selection from being permanently disabled when the block is unmounted
      if (editMode && disableSelection) {
        editModeContext?.onSelectionDisable?.(false);
      }
    },
    [editMode, disableSelection], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSettingsToggle = useCallback(() => setShowSettings?.(s => !s), []);

  const title = useMemo(() => name ?? property?.title, [name, property?.title]);

  const handleBlockDoubleClick = useCallback(() => {
    if (isEditable && !editModeContext.disableSelection) {
      onBlockDoubleClick?.();
      handleEditModeToggle(true);
    }
  }, [isEditable, editModeContext, onBlockDoubleClick, handleEditModeToggle]);

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

  const pluginBlockSettings = useMemo(() => {
    return property;
  }, [property]);

  return {
    title,
    groupId,
    editMode,
    showSettings,
    defaultSettings,
    generalBlockSettings,
    pluginBlockSettings,
    disableSelection,
    handleEditModeToggle,
    handleSettingsToggle,
    handleBlockClick,
    handleDoubleClick,
  };
};
