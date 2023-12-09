import { ReactNode } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import ActionPanel, { type ActionPosition } from "../Block/builtin/common/ActionPanel";
import ClickAwayListener from "../ClickAwayListener";

import useHooks from "./hooks";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  children: ReactNode;
  propertyId?: string;
  panelSettings?: any;
  dndEnabled?: boolean;
  showSettings?: boolean;
  editMode?: boolean;
  position?: ActionPosition;
  noBorder?: boolean;
  isEditable?: boolean;
  hideHoverUI?: boolean;
  overrideGroupId?: string;
  onEditModeToggle?: (enable: boolean) => void;
  onSettingsToggle?: () => void;
  onClick?: () => void;
  onClickAway?: () => void;
  onRemove?: () => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
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

const SelectableArea: React.FC<Props> = ({
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
  panelSettings,
  overrideGroupId,
  onEditModeToggle,
  onSettingsToggle,
  onRemove,
  onClick,
  onClickAway,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
}) => {
  const { showPadding, setShowPadding, handleClickAway } = useHooks({
    editMode,
    isSelected,
    onEditModeToggle,
    onClickAway,
  });

  return !isEditable ? (
    <>{children}</>
  ) : (
    <ClickAwayListener enabled={isSelected} onClickAway={handleClickAway}>
      <Wrapper
        isSelected={isSelected}
        noBorder={noBorder}
        hideHoverUI={hideHoverUI}
        onClick={onClick}>
        <ActionPanel
          title={title}
          icon={icon}
          isSelected={isSelected}
          showSettings={showSettings}
          showPadding={showPadding}
          editMode={editMode}
          propertyId={propertyId}
          panelSettings={panelSettings}
          dndEnabled={dndEnabled}
          position={position}
          overrideGroupId={overrideGroupId}
          hideHoverUI={hideHoverUI}
          setShowPadding={setShowPadding}
          onEditModeToggle={onEditModeToggle}
          onSettingsToggle={onSettingsToggle}
          onRemove={onRemove}
          onPropertyUpdate={onPropertyUpdate}
          onPropertyItemAdd={onPropertyItemAdd}
          onPropertyItemMove={onPropertyItemMove}
          onPropertyItemDelete={onPropertyItemDelete}
        />
        {children}
      </Wrapper>
    </ClickAwayListener>
  );
};

export default SelectableArea;

const Wrapper = styled.div<{ isSelected?: boolean; noBorder?: boolean; hideHoverUI?: boolean }>`
  ${({ noBorder, isSelected, theme }) =>
    !noBorder && `border: 1px solid ${isSelected ? theme.select.main : "transparent"};`}
  transition: all 0.3s;
  padding: 1px;
  position: relative;
  overflow: ${({ isSelected }) => (isSelected ? "visible" : "hidden")};

  :hover {
    border-color: ${({ isSelected, hideHoverUI, theme }) =>
      !hideHoverUI && !isSelected && theme.select.weaker};
    overflow: visible;
  }
`;
