import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { ValueTypes } from "@reearth/beta/utils/value";
import type { Item } from "@reearth/services/api/propertyApi/utils";

import { getFieldValue } from "../../../utils";

type Props = {
  isSelected?: boolean;
  propertyItems?: Item[];
  onClick: (() => void) | undefined;
};

export default ({ isSelected, propertyItems, onClick }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isSelected && editMode) {
      setEditMode(false);
    }
  }, [isSelected, editMode]);

  const handleBlockClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if ((showSettings && isSelected) || editMode) return;
      onClick?.();
    },
    [onClick, showSettings, isSelected, editMode],
  );

  const defaultSettings: Item | undefined = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "default" || i.schemaGroup === "title"),
    [propertyItems],
  );

  const padding = useMemo(
    () => getFieldValue(propertyItems ?? [], "padding", "panel") as ValueTypes["spacing"],
    [propertyItems],
  );

  const handleEditModeToggle = () => setEditMode?.(em => !em);

  const handleSettingsToggle = () => setShowSettings?.(s => !s);

  return {
    editMode,
    showSettings,
    defaultSettings,
    padding,
    setEditMode,
    handleEditModeToggle,
    handleSettingsToggle,
    handleBlockClick,
  };
};
