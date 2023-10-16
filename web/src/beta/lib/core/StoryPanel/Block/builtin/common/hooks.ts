import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  name?: string | null;
  isSelected?: boolean;
  property?: any;
  onClick: (() => void) | undefined;
};

export default ({ name, isSelected, property, onClick }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isSelected && editMode) {
      setEditMode(false);
    }
  }, [isSelected, editMode]);

  const title = useMemo(() => name ?? property?.title, [name, property?.title]);

  const handleBlockClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if ((showSettings && isSelected) || editMode) return;
      onClick?.();
    },
    [onClick, showSettings, isSelected, editMode],
  );

  const defaultSettings = useMemo(() => property?.default ?? property?.title, [property]);

  const groupId = useMemo(
    () => (property?.default ? "default" : property?.title ? "title" : undefined),
    [property],
  );

  const panelSettings = useMemo(() => ({ padding: property?.panel?.padding }), [property?.panel]);

  const handleEditModeToggle = () => setEditMode?.(em => !em);

  const handleSettingsToggle = () => setShowSettings?.(s => !s);

  return {
    title,
    groupId,
    editMode,
    showSettings,
    defaultSettings,
    panelSettings,
    setEditMode,
    handleEditModeToggle,
    handleSettingsToggle,
    handleBlockClick,
  };
};
