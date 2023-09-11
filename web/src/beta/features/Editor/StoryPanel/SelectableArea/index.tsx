import {
  ClassAttributes,
  Dispatch,
  HTMLAttributes,
  LegacyRef,
  ReactNode,
  SetStateAction,
} from "react";
import { JSX } from "react/jsx-runtime";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { type Item } from "@reearth/services/api/propertyApi/utils";
import { styled } from "@reearth/services/theme";

import ActionPanel, { type ActionPosition } from "../Block/builtin/common/ActionPanel";
import ClickAwayListener from "../ClickAwayListener";

import useHooks from "./hooks";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  children?: ReactNode;
  propertyId?: string;
  propertyItems?: Item[];
  dndEnabled?: boolean;
  showSettings?: boolean;
  editMode?: boolean;
  position?: ActionPosition;
  noBorder?: boolean;
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle?: () => void;
  onSettingsToggle?: () => void;
  onClick?: () => void;
  onClickAway?: () => void;
  onRemove?: () => void;
  onDragEnd?: (result: DropResult) => void;
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
  setEditMode,
  onEditModeToggle,
  onSettingsToggle,
  onClick,
  onClickAway,
  onRemove,
}) => {
  const { isHovered, showPadding, panelSettings, setShowPadding, handleMouseOver, handleMouseOut } =
    useHooks({
      editMode,
      isSelected,
      propertyItems,
      setEditMode,
    });

  const handleDragEnd = result => {
    console.log("called", result);
  };

  return (
    <ClickAwayListener enabled={isSelected} onClickAway={onClickAway}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" type="ITEM">
          {provided => (
            <Wrapper
              isSelected={isSelected}
              noBorder={noBorder}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onClick={onClick}
              ref={provided.innerRef}
              {...provided.droppableProps}>
              {(isHovered || isSelected) && (
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
                  onDragEnd={handleDragEnd}
                />
              )}
              <Draggable key={propertyId} draggableId={propertyId} index={propertyId}>
                {(provided: {
                  innerRef: LegacyRef<HTMLDivElement> | undefined;
                  draggableProps: JSX.IntrinsicAttributes &
                    ClassAttributes<HTMLDivElement> &
                    HTMLAttributes<HTMLDivElement>;
                  dragHandleProps: JSX.IntrinsicAttributes &
                    ClassAttributes<HTMLDivElement> &
                    HTMLAttributes<HTMLDivElement>;
                }) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}>
                    {children}
                  </div>
                )}
              </Draggable>

              {provided.placeholder}
            </Wrapper>
          )}
        </Droppable>
      </DragDropContext>
    </ClickAwayListener>
  );
};

export default SelectableArea;

const Wrapper = styled.div<{ isSelected?: boolean; noBorder?: boolean }>`
  ${({ noBorder, isSelected, theme }) =>
    !noBorder &&
    `
border-width: 1px;
border-style: solid;
border-color: ${isSelected ? theme.select.main : "transparent"};
`}
  transition: all 0.3s;
  padding: 1px;
  position: relative;

  :hover {
    border-color: ${({ isSelected, theme }) => !isSelected && theme.select.weaker};
  }
`;
