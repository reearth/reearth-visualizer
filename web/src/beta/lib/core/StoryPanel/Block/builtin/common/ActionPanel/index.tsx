import { Dispatch, SetStateAction } from "react";

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
  panelSettings?: any;
  dndEnabled?: boolean;
  position?: ActionPosition;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle?: () => void;
  onSettingsToggle?: () => void;
  onRemove?: () => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: string,
    v?: any,
  ) => Promise<void>;
  onPropertyItemAdd?: () => Promise<void>;
  onPropertyItemMove?: () => Promise<void>;
  onPropertyItemDelete?: () => Promise<void>;
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
      dndEnabled={dndEnabled}
      isSelected={isSelected}
      actionItems={actionItems}
      onSettingsToggle={onSettingsToggle}
      {...actionProps}
    />
  );
};

export default BlockActionPanel;
