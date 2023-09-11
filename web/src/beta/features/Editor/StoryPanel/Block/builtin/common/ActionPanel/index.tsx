import { Dispatch, SetStateAction } from "react";

import { Item } from "@reearth/services/api/propertyApi/utils";

import ActionPanel, { type ActionPosition } from "../../../../ActionPanel";

import useHooks from "./hooks";

export { type ActionPosition };

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  showSettings?: boolean;
  showPadding?: boolean;
  editMode?: boolean;
  propertyId?: string;
  panelSettings?: Item;
  dndEnabled?: boolean;
  position?: ActionPosition;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle?: () => void;
  onSettingsToggle?: () => void;
  onRemove?: () => void;
  onDragEnd?: any;
};

const BlockActionPanel: React.FC<Props> = ({
  title,
  icon,
  isSelected,
  editMode,
  dndEnabled,
  onEditModeToggle,
  onSettingsToggle,
  onDragEnd,
  ...actionProps
}) => {
  const { actionItems } = useHooks({
    title,
    icon,
    isSelected,
    editMode,
    onEditModeToggle,
    onSettingsToggle,
  });

  return (
    <ActionPanel
      dndEnabled={dndEnabled}
      isSelected={isSelected}
      actionItems={actionItems}
      onSettingsToggle={onSettingsToggle}
      onDragEnd={onDragEnd}
      {...actionProps}
    />
  );
};

export default BlockActionPanel;
