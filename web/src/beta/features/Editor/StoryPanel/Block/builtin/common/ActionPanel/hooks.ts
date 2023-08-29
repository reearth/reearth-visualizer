import { MouseEvent, useMemo } from "react";

import { ActionItem } from "../../../../ActionPanel";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  editMode: boolean;
  onEditModeToggle: (e: MouseEvent<HTMLDivElement>) => void;
  onSettingsToggle: (e: MouseEvent<HTMLDivElement>) => void;
};

export default ({
  title,
  icon,
  isSelected,
  editMode,
  onEditModeToggle,
  onSettingsToggle,
}: Props) => {
  const actionItems: ActionItem[] = useMemo(
    () => [
      {
        name: title ?? "Story Block",
        icon: icon ?? "plugin",
      },
      {
        icon: editMode ? "exit" : "storyBlockEdit",
        hide: !isSelected,
        onClick: onEditModeToggle,
      },
      {
        icon: "settings",
        hide: !isSelected,
        onClick: onSettingsToggle,
      },
    ],
    [title, icon, isSelected, editMode, onEditModeToggle, onSettingsToggle],
  );
  return {
    actionItems,
  };
};
