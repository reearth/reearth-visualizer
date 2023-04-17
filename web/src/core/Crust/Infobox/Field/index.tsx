import { ReactNode, useState } from "react";

import Icon from "@reearth/components/atoms/Icon";
import InsertionBar from "@reearth/components/atoms/InsertionBar";
import { styled } from "@reearth/theme";

import useHooks from "./hooks";

export type Props = {
  children?: ReactNode;
  id?: string;
  index?: number;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  insertionPopUpPosition?: "top" | "bottom";
  isInfoboxHovered?: boolean;
  dragDisabled?: boolean;
  renderInsertionPopUp?: React.ReactNode;
  onInsert?: (pos: "top" | "bottom") => void;
  onMove?: (blockId: string, fromIndex: number, toIndex: number) => void;
};

export default function Field({
  children,
  id,
  index,
  isEditable,
  isBuilt,
  isSelected,
  renderInsertionPopUp,
  insertionPopUpPosition,
  dragDisabled,
  onMove,
  onInsert,
}: Props): JSX.Element | null {
  const { dragRef, dropRef, isHovered, isDragging, previewRef } = useHooks({
    id,
    index,
    onMove,
  });
  const [hover, setHover] = useState(false);

  return (
    <Wrapper ref={dropRef}>
      <BlockWrapper
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        isDragging={isDragging}
        isEditable={isEditable && !isBuilt}
        ref={previewRef}>
        {children}
        {isEditable && !isBuilt && !dragDisabled && hover && (
          <Handle
            ref={dragRef}
            isHovered={!!isEditable && !isBuilt && hover && !isSelected}
            isSelected={!!isEditable && !isBuilt && !!isSelected}>
            <Icon icon="arrowUpDown" size={24} />
          </Handle>
        )}
      </BlockWrapper>
      {!isBuilt && isEditable && (
        <>
          <InsertionBar
            mode={
              isEditable && isHovered === "top"
                ? "dragging"
                : isEditable && !isHovered && index === 0
                ? "visible"
                : "hidden"
            }
            pos="top"
            onButtonClick={() => onInsert?.("top")}>
            {insertionPopUpPosition === "top" && renderInsertionPopUp}
          </InsertionBar>
          <InsertionBar
            mode={
              isEditable && isHovered === "bottom"
                ? "dragging"
                : !isEditable || isHovered
                ? "hidden"
                : "visible"
            }
            pos="bottom"
            onButtonClick={() => onInsert?.("bottom")}>
            {insertionPopUpPosition === "bottom" && renderInsertionPopUp}
          </InsertionBar>
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  margin: 0;
  padding: 10px 0;
  border-radius: 6px;
`;

const BlockWrapper = styled.div<{
  isDragging?: boolean;
  isEditable?: boolean;
}>`
  position: relative;
  opacity: ${props => (props.isDragging ? "0.4" : "1")};
  cursor: ${props => (props.isEditable ? "pointer" : "")};
  box-sizing: border-box;
`;

const Handle = styled.div<{ isHovered: boolean; isSelected: boolean }>`
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  padding: 5px;
  margin: 3px 6px;
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : "none"};
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;
