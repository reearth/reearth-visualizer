import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, MouseEvent, ReactNode } from "react";

import ClickAwayListener from "../../../Crust/StoryPanel/ClickAwayListener";
import type { ContentSettings } from "../../types";

import ActionPanel, { type ActionPosition } from "./ActionPanel";
import useHooks from "./hooks";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  children: ReactNode;
  propertyId?: string;
  contentSettings?: ContentSettings;
  isPluginBlock?: boolean;
  dndEnabled?: boolean;
  showSettings?: boolean;
  editMode?: boolean;
  position?: ActionPosition;
  noBorder?: boolean;
  isEditable?: boolean;
  hideHoverUI?: boolean;
  overrideGroupId?: string;
  domId?: string;
  dragHandleClassName?: string;
  onEditModeToggle?: (enable: boolean) => void;
  onSettingsToggle?: () => void;
  onClick?: (e: MouseEvent<Element>) => void;
  onDoubleClick?: (e: MouseEvent<Element>) => void;
  onClickAway?: () => void;
  onRemove?: () => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
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

const SelectableArea: FC<Props> = ({
  title,
  icon,
  isSelected,
  children,
  propertyId,
  dndEnabled,
  showSettings,
  editMode,
  position,
  noBorder,
  isEditable,
  hideHoverUI,
  contentSettings,
  isPluginBlock,
  overrideGroupId,
  dragHandleClassName,
  domId,
  onEditModeToggle,
  onSettingsToggle,
  onRemove,
  onClick,
  onDoubleClick,
  onClickAway,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete
}) => {
  const {
    showPadding,
    isHovered,
    handleHoverChange,
    setShowPadding,
    handleClickAway
  } = useHooks({
    editMode,
    isSelected,
    onEditModeToggle,
    onClickAway
  });

  return !isEditable ? (
    <div id={domId}>{children}</div>
  ) : (
    <ClickAwayListener enabled={isSelected} onClickAway={handleClickAway}>
      <Wrapper
        id={domId}
        isSelected={isSelected}
        noBorder={noBorder}
        hideHoverUI={hideHoverUI}
        onMouseOver={handleHoverChange(true)}
        onMouseOut={handleHoverChange(false)}
      >
        <div onClick={onClick} onDoubleClick={onDoubleClick}>
          {children}
        </div>
        {(isSelected || (!hideHoverUI && isHovered)) && (
          <ActionPanel
            title={title}
            icon={icon}
            isSelected={isSelected}
            showSettings={showSettings}
            showPadding={showPadding}
            editMode={editMode}
            propertyId={propertyId}
            contentSettings={contentSettings}
            isPluginBlock={isPluginBlock}
            dndEnabled={dndEnabled}
            position={position}
            dragHandleClassName={dragHandleClassName}
            overrideGroupId={overrideGroupId}
            setShowPadding={setShowPadding}
            onEditModeToggle={onEditModeToggle}
            onSettingsToggle={onSettingsToggle}
            onClick={onClick}
            onRemove={onRemove}
            onPropertyUpdate={onPropertyUpdate}
            onPropertyItemAdd={onPropertyItemAdd}
            onPropertyItemMove={onPropertyItemMove}
            onPropertyItemDelete={onPropertyItemDelete}
          />
        )}
      </Wrapper>
    </ClickAwayListener>
  );
};

export default SelectableArea;

const Wrapper = styled("div")<{
  isSelected?: boolean;
  noBorder?: boolean;
  hideHoverUI?: boolean;
}>(({ isSelected, noBorder, hideHoverUI, theme }) => ({
  border: !noBorder
    ? `1px solid ${isSelected ? theme.select.main : "transparent"}`
    : "none",
  padding: "1px",
  position: "relative",
  "&:hover": {
    borderColor: !hideHoverUI && !isSelected ? theme.select.weaker : "none"
  }
}));
