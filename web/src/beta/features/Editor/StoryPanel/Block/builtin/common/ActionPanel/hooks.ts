import { useMemo } from "react";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  editMode: boolean;
  onEditModeToggle: () => void;
  onSettingsToggle: () => void;
};

export default ({
  title,
  icon,
  isSelected,
  editMode,
  onEditModeToggle,
  onSettingsToggle,
}: Props) => {
  const actionItems = useMemo(
    () => [
      {
        blockName: title ?? "Story Block",
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
