import { Dispatch, MouseEvent, SetStateAction, useCallback, useMemo } from "react";

import { useItemContext as useDnDItemContext } from "@reearth/beta/components/DragAndDropList/Item";
import type { Icons } from "@reearth/beta/components/Icon";
import { useT } from "@reearth/services/i18n";

import type { ActionItem } from "../../ActionPanel";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  editMode?: boolean;
  panelSettings?: any;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onRemove?: () => void;
  onEditModeToggle?: (enable: boolean) => void;
  onSettingsToggle?: (e?: MouseEvent<HTMLDivElement>) => void;
};

export default ({
  title,
  icon,
  isSelected,
  editMode,
  panelSettings,
  setShowPadding,
  onRemove,
  onEditModeToggle,
  onSettingsToggle,
}: Props) => {
  const t = useT();
  const dndItemContextRef = useDnDItemContext();

  const handleRemove = useCallback(() => {
    onRemove?.();
    onSettingsToggle?.();
  }, [onRemove, onSettingsToggle]);

  const settingsTitle = useMemo(() => t("Spacing settings"), [t]);

  const popoverContent = useMemo(() => {
    const menuItems: { name: string; icon: Icons; onClick: () => void }[] = [];
    if (panelSettings) {
      menuItems.push({
        name: settingsTitle,
        icon: "padding",
        onClick: () => setShowPadding(true),
      });
    }
    if (onRemove) {
      menuItems.push({
        name: t("Remove"),
        icon: "trash",
        onClick: handleRemove,
      });
    }
    return menuItems;
  }, [settingsTitle, panelSettings, t, setShowPadding, onRemove, handleRemove]);

  const actionItems: ActionItem[] = useMemo(() => {
    const menuItems: ActionItem[] = [
      {
        name: title ?? t("Block"),
        icon: icon ?? "plugin",
      },
    ];

    if (onEditModeToggle && !!panelSettings) {
      menuItems.push({
        icon: editMode ? "exit" : "storyBlockEdit",
        hide: !isSelected,
        onClick: () => onEditModeToggle?.(!editMode),
      });
    }

    if (onSettingsToggle) {
      menuItems.push({
        icon: "settings",
        hide: !isSelected,
        onClick: onSettingsToggle,
      });
    }

    return menuItems;
  }, [title, icon, isSelected, editMode, panelSettings, t, onEditModeToggle, onSettingsToggle]);

  return {
    dndItemContextRef,
    settingsTitle,
    popoverContent,
    actionItems,
  };
};
