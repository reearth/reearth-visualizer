import { Dispatch, MouseEvent, SetStateAction } from "react";

import ActionPanelUI, { type ActionPosition } from "../../ActionPanel";

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
  contentSettings?: any;
  dndEnabled?: boolean;
  position?: ActionPosition;
  overrideGroupId?: string;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle?: (enable: boolean) => void;
  onSettingsToggle?: () => void;
  onClick?: (e: MouseEvent<Element>) => void;
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

const ActionPanel: React.FC<Props> = ({
  title,
  icon,
  isSelected,
  editMode,
  dndEnabled,
  contentSettings,
  setShowPadding,
  onEditModeToggle,
  onSettingsToggle,
  onRemove,
  ...actionProps
}) => {
  const { customDragSource, settingsTitle, popoverContent, actionItems } = useHooks({
    title,
    icon,
    isSelected,
    editMode,
    contentSettings,
    setShowPadding,
    onEditModeToggle,
    onSettingsToggle,
    onRemove,
  });

  return (
    <ActionPanelUI
      ref={customDragSource}
      dndEnabled={dndEnabled}
      isSelected={isSelected}
      actionItems={actionItems}
      contentSettings={contentSettings}
      settingsTitle={settingsTitle}
      popoverContent={popoverContent}
      setShowPadding={setShowPadding}
      onSettingsToggle={onSettingsToggle}
      {...actionProps}
    />
  );
};

export default ActionPanel;
