import { useCallback, useMemo, useState } from "react";

import { ValueTypes } from "@reearth/beta/utils/value";
import type { Item } from "@reearth/services/api/propertyApi/utils";

import { getFieldValue } from "../utils";

type Props = {
  isSelected?: boolean;
  propertyItems?: Item[];
  onClick: (() => void) | undefined;
};

export default ({ isSelected, propertyItems, onClick }: Props) => {
  const [isHovered, setHover] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPadding, setShowPadding] = useState(false);

  const handleEditModeToggle = useCallback(() => setEditMode(em => !em), []);

  const handleSettingsToggle = useCallback(() => setShowSettings(s => !s), []);

  const handleMouseEnter = useCallback(() => setHover(true), []);

  const handleMouseLeave = useCallback(() => setHover(false), []);

  const handleBlockClick = useCallback(() => {
    if (showSettings && isSelected) return;
    onClick?.();
  }, [onClick, showSettings, isSelected]);

  const defaultSettings: Item | undefined = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "default"),
    [propertyItems],
  );

  const panelSettings: Item | undefined = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "panel"),
    [propertyItems],
  );

  const padding = useMemo(
    () => getFieldValue(propertyItems ?? [], "padding", "panel") as ValueTypes["spacing"],
    [propertyItems],
  );

  return {
    isHovered,
    editMode,
    showSettings,
    showPadding,
    defaultSettings,
    panelSettings,
    padding,
    setShowPadding,
    handleMouseEnter,
    handleMouseLeave,
    handleBlockClick,
    handleEditModeToggle,
    handleSettingsToggle,
  };
};
