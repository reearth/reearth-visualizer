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
  overrideGroupId?: string;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle?: (enable: boolean) => void;
  onSettingsToggle?: () => void;
  onRemove?: () => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
  onBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

const BlockActionPanel: React.FC<Props> = ({
  title,
  icon,
  isSelected,
  editMode,
  dndEnabled,
  panelSettings,
  onEditModeToggle,
  onSettingsToggle,
  ...actionProps
}) => {
  const { actionItems } = useHooks({
    title,
    icon,
    isSelected,
    editMode,
    panelSettings,
    onEditModeToggle,
    onSettingsToggle,
  });

  return (
    <ActionPanel
      dndEnabled={dndEnabled}
      isSelected={isSelected}
      actionItems={actionItems}
      panelSettings={panelSettings}
      onSettingsToggle={onSettingsToggle}
      {...actionProps}
    />
  );
};

export default BlockActionPanel;
