import { Dispatch, FC, MouseEvent, SetStateAction } from "react";

import type { ContentSettings } from "../../../types";
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
  contentSettings?: ContentSettings;
  dragHandleClassName?: string;
  isPluginBlock?: boolean;
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
    vt?: import("@reearth/app/utils/value").ValueType,
    v?: import("@reearth/app/utils/value").ValueTypes[import("@reearth/app/utils/value").ValueType]
  ) => Promise<void>;
  onBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
};

const ActionPanel: FC<Props> = ({
  title,
  icon,
  isSelected,
  editMode,
  dndEnabled,
  contentSettings,
  isPluginBlock,
  dragHandleClassName,
  setShowPadding,
  onEditModeToggle,
  onSettingsToggle,
  onRemove,
  ...actionProps
}) => {
  const {
    settingsTitle,
    popupMenuItem,
    actionItems,
    openMenu,
    setOpenMenu,
    handlePopupMenuClick
  } = useHooks({
    title,
    icon,
    isSelected,
    editMode,
    contentSettings,
    isPluginBlock,
    setShowPadding,
    onEditModeToggle,
    onSettingsToggle,
    onRemove
  });

  return (
    <ActionPanelUI
      dndEnabled={dndEnabled}
      isSelected={isSelected}
      actionItems={actionItems}
      dragHandleClassName={dragHandleClassName}
      contentSettings={contentSettings}
      settingsTitle={settingsTitle}
      popupMenuItem={popupMenuItem}
      openMenu={openMenu}
      onPopupMenuClick={handlePopupMenuClick}
      setOpenMenu={setOpenMenu}
      setShowPadding={setShowPadding}
      onSettingsToggle={onSettingsToggle}
      {...actionProps}
    />
  );
};

export default ActionPanel;
