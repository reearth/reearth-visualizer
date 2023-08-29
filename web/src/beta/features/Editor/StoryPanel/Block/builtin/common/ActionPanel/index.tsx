import { Dispatch, MouseEvent, SetStateAction } from "react";

import { Item } from "@reearth/services/api/propertyApi/utils";

import ActionPanel from "../../../../ActionPanel";

import useHooks from "./hooks";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  showSettings?: boolean;
  showPadding?: boolean;
  editMode: boolean;
  propertyId?: string;
  panelSettings?: Item;
  dndEnabled?: boolean;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle: (e?: MouseEvent<HTMLDivElement>) => void;
  onSettingsToggle: (e?: MouseEvent<HTMLDivElement>) => void;
  onRemove?: () => void;
};

const BlockActionPanel: React.FC<Props> = ({
  title,
  icon,
  isSelected,
  editMode,
  dndEnabled,
  onEditModeToggle,
  onSettingsToggle,
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
      {...actionProps}
      dndEnabled={dndEnabled}
      isSelected={isSelected}
      actionItems={actionItems}
      onSettingsToggle={onSettingsToggle}
    />
  );
};

export default BlockActionPanel;
