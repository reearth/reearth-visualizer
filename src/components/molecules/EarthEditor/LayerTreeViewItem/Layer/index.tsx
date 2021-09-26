import React, { forwardRef } from "react";

import HelpButton from "@reearth/components/atoms/HelpButton";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import useDoubleClick from "@reearth/util/use-double-click";

import LayerActions, { Format } from "../LayerActions";

import useHooks from "./hooks";
import useEditable from "./use-editable";

export type { Format } from "../LayerActions";

export type DropType = "top" | "bottom" | "bottomOfChildren";

export type Layer<T = unknown> = {
  title?: string;
  description?: string;
  icon?: string;
  type?: string;
  group?: boolean;
  childrenCount?: number;
  linked?: boolean;
  deactivated?: boolean;
  visible?: boolean;
  renamable?: boolean;
  visibilityChangeable?: boolean;
  showChildrenCount?: boolean;
  showLayerActions?: boolean;
  underlined?: boolean;
} & T;

export type Props = {
  className?: string;
  rootLayerId?: string;
  selectedLayerId?: string;
  layer: Layer;
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
  childSelected?: boolean;
  dropType?: DropType;
  allSiblingsDoesNotHaveChildren?: boolean;
  visibilityShown?: boolean;
  onClick: () => void;
  onExpand?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  onRename?: (name: string) => void;
  onRemove?: (selectedLayerId: string) => void;
  onGroupCreate?: () => void;
  onImport?: (file: File, format: Format) => void;
};

const Layer: React.ForwardRefRenderFunction<HTMLDivElement, Props> = (
  {
    className,
    rootLayerId,
    selectedLayerId,
    layer: {
      title,
      description,
      icon,
      type,
      group,
      linked,
      childrenCount,
      visible,
      renamable,
      visibilityChangeable,
      deactivated,
      showChildrenCount,
      showLayerActions,
      underlined,
    },
    expanded,
    selected,
    childSelected,
    dropType,
    allSiblingsDoesNotHaveChildren,
    visibilityShown,
    onVisibilityChange,
    onClick,
    onExpand,
    onRename,
    onRemove,
    onGroupCreate,
    onImport,
  },
  ref,
) => {
  const { isHover, showHelp, handleExpand, handleVisibilityChange, toggleHover } = useHooks({
    group,
    visibilityChangeable,
    visible,
    onExpand,
    onVisibilityChange,
  });

  const { editing, editingName, startEditing, inputProps } = useEditable({
    name: title,
    renamable,
    onRename,
  });
  const [handleClick, handleDoubleClick] = useDoubleClick(onClick, startEditing);

  const theme = useTheme();

  return (
    <Wrapper
      ref={ref}
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      dropType={dropType}
      selected={selected}
      childSelected={childSelected}
      disabled={deactivated}
      underlined={underlined}
      type={type}
      onMouseEnter={() => toggleHover(true)}
      onMouseLeave={() => toggleHover(false)}
      hover={isHover}>
      <ArrowIconWrapper
        allSiblingsDoesNotHaveChildren={allSiblingsDoesNotHaveChildren}
        onClick={handleExpand}>
        {group && <ArrowIcon open={expanded} icon="arrowToggle" size={10} />}
      </ArrowIconWrapper>
      <LayerIconWrapper>
        <LayerIcon
          selected={selected}
          disabled={deactivated}
          type={type}
          icon={icon ?? (group ? (linked ? "dataset" : "folder") : "layerItem")}
          size={16}
          color={
            selected
              ? theme.layers.selectedTextColor
              : deactivated
              ? theme.layers.disableTextColor
              : theme.layers.textColor
          }
        />
      </LayerIconWrapper>
      {editing ? (
        <Input type="text" {...inputProps} onClick={stopPropagation} />
      ) : (
        <>
          <LayerName
            size="xs"
            selected={selected}
            disabled={deactivated}
            color={
              selected
                ? theme.layers.selectedTextColor
                : deactivated
                ? theme.layers.disableTextColor
                : theme.layers.textColor
            }>
            {editingName}
          </LayerName>
          {group && typeof childrenCount === "number" && showChildrenCount && (
            <LayerCount
              size="xs"
              selected={selected}
              color={
                selected
                  ? theme.layers.selectedTextColor
                  : deactivated
                  ? theme.layers.disableTextColor
                  : theme.layers.textColor
              }>
              {childrenCount}
            </LayerCount>
          )}
          {visibilityShown && typeof visible === "boolean" && (
            <Visibility
              isVisible={!visible || isHover || selected}
              onClick={handleVisibilityChange}>
              <LayerIcon
                icon={!visible ? "hidden" : "visible"}
                size={16}
                selected={selected}
                disabled={deactivated}
                type={type}
              />
            </Visibility>
          )}
          {showHelp && description && (
            <HelpButton
              balloonDirection="right"
              gap={16}
              descriptionTitle={title}
              description={description}>
              <StyledIcon icon="question" size={"15px"} />
            </HelpButton>
          )}
          {showLayerActions && (
            <LayerActionsWrapper>
              <LayerActions
                rootLayerId={rootLayerId}
                selectedLayerId={selectedLayerId}
                onLayerImport={onImport}
                onLayerRemove={onRemove}
                onLayerGroupCreate={onGroupCreate}></LayerActions>
            </LayerActionsWrapper>
          )}
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  selected?: boolean;
  childSelected?: boolean;
  dropType?: DropType;
  hover?: boolean;
  disabled?: boolean;
  type?: string;
  underlined?: boolean;
}>`
  user-select: none;
  width: 100%;
  height: 35px;
  display: flex;
  justify-content: start;
  align-items: center;
  cursor: pointer;
  color: ${({ selected, disabled, type, theme }) =>
    type === "widget" && disabled !== undefined
      ? disabled && !selected
        ? theme.main.weak
        : selected || !disabled
        ? theme.main.strongText
        : theme.main.text
      : selected
      ? theme.main.strongText
      : theme.main.text};
  box-sizing: border-box;
  background-color: ${({ selected, theme, hover }) =>
    selected ? theme.layers.selectedLayer : hover ? theme.main.bg : "transparent"};
  border: 2px solid transparent;
  border-color: ${({ dropType, selected, theme }) =>
    dropType === "bottomOfChildren" || dropType === "top" || dropType === "bottom"
      ? dropType === "top"
        ? `${theme.main.danger} transparent transparent transparent`
        : dropType === "bottom"
        ? `transparent transparent ${theme.main.danger} transparent`
        : theme.main.danger
      : selected
      ? theme.layers.selectedLayer
      : "transparent"};
  border-bottom-color: ${({ underlined, theme }) => underlined && theme.layers.bottomBorder};
  font-size: ${fonts.sizes.xs}px;
  border-right: ${({ childSelected, theme }) =>
    childSelected ? `2px solid ${theme.main.select}` : undefined};
`;

const ArrowIconWrapper = styled.div<{ allSiblingsDoesNotHaveChildren?: boolean }>`
  flex: 0 0
    ${({ allSiblingsDoesNotHaveChildren }) => (allSiblingsDoesNotHaveChildren ? "2px" : "14px")};
  display: flex;
  align-items: center;
  align-self: stretch;
  text-align: center;
`;

const StyledIcon = styled(Icon)`
  color: ${props => props.theme.main.strongText};
`;

const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) => open && "translateY(10%) rotate(90deg)"};
`;

const Input = styled.input`
  border: none;
  background: ${props => props.theme.properties.deepBg};
  outline: none;
  color: ${props => props.theme.leftMenu.text};
  padding: 3px;
  flex: auto;
  overflow: hidden;
`;

const LayerIconWrapper = styled.div`
  flex: 0 0 26px;
  text-align: center;
`;

const LayerIcon = styled(Icon)<{ disabled?: boolean; selected?: boolean; type?: string }>`
  margin: 0 5px;
  flex: 0 0 auto;
`;

const LayerName = styled(Text)<{ disabled?: boolean; selected?: boolean }>`
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: auto;
  overflow: hidden;
`;

const LayerCount = styled(Text)<{ selected?: boolean }>`
  margin-right: 10px;
  &::before {
    content: "(";
  }
  &::after {
    content: ")";
  }
`;

const Visibility = styled.div<{ isVisible?: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
`;

const LayerActionsWrapper = styled.div``;

const stopPropagation = <E extends any>(event: React.MouseEvent<E, MouseEvent>) =>
  event.stopPropagation();

export default forwardRef(Layer);
