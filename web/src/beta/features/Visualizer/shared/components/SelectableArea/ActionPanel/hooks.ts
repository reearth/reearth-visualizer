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
  contentSettings?: any;
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
  contentSettings,
  setShowPadding,
  onRemove,
  onEditModeToggle,
  onSettingsToggle,
}: Props) => {
  const t = useT();
  const { customDragSource } = useDnDItemContext() ?? {};

  const handleRemove = useCallback(() => {
    onRemove?.();
    onSettingsToggle?.();
  }, [onRemove, onSettingsToggle]);

  const settingsTitle = useMemo(() => t("Spacing settings"), [t]);

  const popoverContent = useMemo(() => {
    const menuItems: { name: string; icon: Icons; onClick: () => void }[] = [];
    if (contentSettings) {
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
  }, [settingsTitle, contentSettings, t, setShowPadding, onRemove, handleRemove]);

  const actionItems: ActionItem[] = useMemo(() => {
    const menuItems: ActionItem[] = [
      {
        name: title ?? t("Block"),
        icon: icon ?? "plugin",
      },
    ];

    if (onEditModeToggle && !!contentSettings) {
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
  }, [title, icon, isSelected, editMode, contentSettings, t, onEditModeToggle, onSettingsToggle]);

  return {
    customDragSource,
    settingsTitle,
    popoverContent,
    actionItems,
  };
};
