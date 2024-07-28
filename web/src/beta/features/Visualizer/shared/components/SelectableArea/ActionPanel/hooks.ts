import { Dispatch, MouseEvent, SetStateAction, useCallback, useMemo } from "react";

import { getIcon } from "@reearth/beta/features/Visualizer/Crust/StoryPanel/utils";
import { IconName } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";

import type { ActionItem } from "../../ActionPanel";

type Props = {
  title?: string;
  icon?: string | IconName;
  isSelected?: boolean;
  editMode?: boolean;
  contentSettings?: any;
  isPluginBlock?: boolean;
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
  isPluginBlock,
  setShowPadding,
  onRemove,
  onEditModeToggle,
  onSettingsToggle,
}: Props) => {
  const t = useT();
  const handleRemove = useCallback(() => {
    onRemove?.();
    onSettingsToggle?.();
  }, [onRemove, onSettingsToggle]);

  const settingsTitle = useMemo(() => t("Spacing settings"), [t]);

  const popupItem = useMemo(() => {
    const menuItems: { name: string; icon: IconName; onClick: () => void }[] = [];
    if (!isPluginBlock && contentSettings) {
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
  }, [isPluginBlock, settingsTitle, contentSettings, t, setShowPadding, onRemove, handleRemove]);

  const actionItems: ActionItem[] = useMemo(() => {
    const iconName = getIcon(icon);
    const menuItems: ActionItem[] = [
      {
        name: title ?? t("Block"),
        icon: iconName,
      },
    ];

    if (onEditModeToggle && !!contentSettings && Object.keys(contentSettings).length !== 0) {
      menuItems.push({
        icon: editMode ? "exit" : "editMode",
        hide: !isSelected,
        onClick: () => onEditModeToggle?.(!editMode),
      });
    }

    if (onSettingsToggle) {
      menuItems.push({
        icon: "settingFilled",
        hide: !isSelected,
        onClick: onSettingsToggle,
      });
    }

    return menuItems;
  }, [title, icon, isSelected, editMode, contentSettings, t, onEditModeToggle, onSettingsToggle]);

  return {
    settingsTitle,
    popupItem,
    actionItems,
  };
};
