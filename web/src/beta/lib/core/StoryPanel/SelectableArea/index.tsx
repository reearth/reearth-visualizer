import { Dispatch, ReactNode, SetStateAction } from "react";

import { type Item } from "@reearth/services/api/propertyApi/utils";
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
  propertyItems?: Item[];
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
  onClickAway?: () => void;
  onRemove?: () => void;
};

const SelectableArea: React.FC<Props> = ({
  title,
  icon,
  isSelected,
  children,
  propertyId,
  propertyItems,
  dndEnabled,
  showSettings,
  editMode,
  position,
  noBorder,
  isEditable,
  setEditMode,
  onEditModeToggle,
  onSettingsToggle,
  onClick,
  onClickAway,
  onRemove,
}) => {
  const { showPadding, panelSettings, setShowPadding, handleClickAway } = useHooks({
    editMode,
    isSelected,
    propertyItems,
    setEditMode,
    onClickAway,
  });

  return !isEditable ? (
    <>{children}</>
  ) : (
    <ClickAwayListener enabled={isSelected} onClickAway={handleClickAway}>
      <Wrapper isSelected={isSelected} noBorder={noBorder} onClick={onClick}>
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
        />
        {children}
      </Wrapper>
    </ClickAwayListener>
  );
};

export default SelectableArea;

const Wrapper = styled.div<{ isSelected?: boolean; noBorder?: boolean }>`
  ${({ noBorder, isSelected, theme }) =>
    !noBorder && `border: 1px solid ${isSelected ? theme.select.main : "transparent"};`}
  transition: all 0.3s;
  padding: 1px;
  position: relative;
  overflow: hidden;

  :hover {
    border-color: ${({ isSelected, theme }) => !isSelected && theme.select.weaker};
    overflow: visible;
  }
`;
