import { MouseEvent, useMemo } from "react";

import { ActionItem } from "../../../../ActionPanel";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  editMode?: boolean;
  panelSettings?: any;
  onEditModeToggle?: (enable: boolean) => void;
  onSettingsToggle?: (e?: MouseEvent<HTMLDivElement>) => void;
};

export default ({
  title,
  icon,
  isSelected,
  editMode,
  panelSettings,
  onEditModeToggle,
  onSettingsToggle,
}: Props) => {
  const actionItems: ActionItem[] = useMemo(() => {
    const menuItems: ActionItem[] = [
      {
        name: title ?? "Story Block",
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
  }, [title, icon, isSelected, editMode, panelSettings, onEditModeToggle, onSettingsToggle]);
  return {
    actionItems,
  };
};
