import { Dispatch, ReactNode, SetStateAction } from "react";

import { styled } from "@reearth/services/theme";

import ActionPanel, { type ActionPosition } from "../Block/builtin/common/ActionPanel";

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
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle?: () => void;
  onSettingsToggle?: () => void;
  onClick?: () => void;
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
  panelSettings,
  setEditMode,
  onEditModeToggle,
  onSettingsToggle,
  onRemove,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
}) => {
  const { showPadding, setShowPadding } = useHooks({
    editMode,
    isSelected,
    setEditMode,
  });

  return !isEditable ? (
    <>{children}</>
  ) : (
    <Wrapper isSelected={isSelected} noBorder={noBorder}>
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
  );
};

export default SelectableArea;

const Wrapper = styled.div<{ isSelected?: boolean; noBorder?: boolean }>`
  ${({ noBorder, isSelected, theme }) =>
    !noBorder && `border: 1px solid ${isSelected ? theme.select.main : "transparent"};`}
  transition: all 0.3s;
  padding: 1px;
  position: relative;
  overflow: ${({ isSelected }) => (isSelected ? "visible" : "hidden")};

  :hover {
    border-color: ${({ isSelected, theme }) => !isSelected && theme.select.weaker};
    overflow: visible;
  }
`;
