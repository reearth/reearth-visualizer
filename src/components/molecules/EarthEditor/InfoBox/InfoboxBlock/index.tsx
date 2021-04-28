import React, { useState } from "react";
import { styled } from "@reearth/theme";

import useHooks from "./hooks";

import Icon from "@reearth/components/atoms/Icon";
import InsertionBar from "@reearth/components/atoms/InsertionBar";
import PluginBlock, {
  InfoboxProperty,
} from "@reearth/components/molecules/Common/plugin/PluginBlock";
import { ValueTypes, ValueType, SceneProperty } from "@reearth/util/value";

export interface Block {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: { [key: string]: any };
  pluginProperty?: { [key: string]: any };
  infoboxProperty?: InfoboxProperty;
  isLinked?: boolean;
}

export interface Props {
  block?: Block;
  index?: number;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  onChange?: <T extends ValueType>(
    propertyId: string,
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
  onMove?: (blockId: string, fromIndex: number, toIndex: number) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  insertionPopUpPosition?: "top" | "bottom";
  renderInsertionPopUp?: React.ReactNode;
  onInsertionBarButtonClick?: (pos: "top" | "bottom") => void;
  isInfoboxHovered?: boolean;
  dragDisabled?: boolean;
  infoboxProperty?: InfoboxProperty;
  sceneProperty?: SceneProperty;
}

const InfoboxBlock: React.FC<Props> = ({
  block,
  index,
  isEditable,
  isBuilt,
  onChange,
  onMove,
  isSelected,
  onSelect,
  // onDelete,
  renderInsertionPopUp,
  insertionPopUpPosition,
  onInsertionBarButtonClick,
  dragDisabled,
  infoboxProperty,
  sceneProperty,
}) => {
  const { dragRef, dropRef, isHovered, isDragging, previewRef } = useHooks({
    blockId: block?.id,
    index,
    onMove,
  });
  const [hover, setHover] = useState(false);
  const handleClick = (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isEditable && !isBuilt) {
      e?.stopPropagation();
      onSelect?.();
    }
  };

  return !block ? null : (
    <Wrapper ref={dropRef}>
      <BlockWrapper
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        isDragging={isDragging}
        isEditable={isEditable && !isBuilt}
        isHovered={!!isEditable && !isBuilt && hover && !isSelected}
        isSelected={!!isEditable && !isBuilt && !!isSelected}
        ref={previewRef}>
        <PluginBlock
          {...block}
          isSelected={!!isEditable && !isBuilt && !!isSelected}
          isEditable={isEditable && !block.isLinked}
          isBuilt={isBuilt}
          isHovered={!!isEditable && !isBuilt && hover && !isSelected}
          infoboxProperty={infoboxProperty}
          sceneProperty={sceneProperty}
          onChange={onChange}
          onClick={handleClick}
        />
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
            onButtonClick={() => onInsertionBarButtonClick?.("top")}>
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
            onButtonClick={() => onInsertionBarButtonClick?.("bottom")}>
            {insertionPopUpPosition === "bottom" && renderInsertionPopUp}
          </InsertionBar>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  margin: 0;
  padding: 10px 0;
  border-radius: 6px;
`;

type BlockWrapperProps = {
  isDragging?: boolean;
  isEditable?: boolean;
  isHovered: boolean;
  isSelected: boolean;
};

const BlockWrapper = styled.div<BlockWrapperProps>`
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

export default InfoboxBlock;
