import { ReactNode, useCallback, useEffect, useState } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import type { LayerStyleNameUpdateProps } from "@reearth/beta/features/Editor/useLayerStyles";
import useDoubleClick from "@reearth/beta/utils/use-double-click";
import { styled } from "@reearth/services/theme";

type Props = {
  id?: string;
  className?: string;
  name: string;
  selected?: boolean;
  actionContent?: ReactNode;
  onSelect?: (selected: boolean) => void;
  onOpenChange?: (isOpen: boolean) => void;
  onLayerStyleNameUpdate: (inp: LayerStyleNameUpdateProps) => void;
};

const LayerStyleCard: React.FC<Props> = ({
  className,
  id,
  name,
  selected,
  actionContent,
  onSelect,
  onOpenChange,
  onLayerStyleNameUpdate,
}) => {
  const [isOpenAction, setIsOpenAction] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const [handleSingleClick, handleDoubleClick] = useDoubleClick(
    () => onSelect?.(!selected),
    () => setIsEditing(true),
  );

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleNameSubmit = useCallback(
    (newName: string) => {
      setNewName(newName);
      setIsEditing(false);
      onLayerStyleNameUpdate?.({ styleId: id || "", name: newName });
    },
    [id, onLayerStyleNameUpdate],
  );

  const handleActionClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpenAction(!isOpenAction);
    },
    [isOpenAction],
  );

  const handleEditExit = useCallback(
    (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (newName !== name && e?.key !== "Escape") {
        handleNameSubmit(newName);
      } else {
        setNewName(name);
      }
      setIsEditing(false);
    },
    [handleNameSubmit, name, newName],
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsOpenAction(isOpen);
      onOpenChange?.(isOpen);
    },
    [onOpenChange],
  );

  return (
    <Wrapper
      className={className}
      selected={selected}
      onClick={handleSingleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <MainWrapper>
        <Icon icon="layerStyle" />
        {actionContent && (
          <Popover.Provider open={isOpenAction} onOpenChange={handleOpenChange}>
            {(isHovered || isOpenAction) && (
              <Popover.Trigger asChild>
                <ActionIcon onClick={handleActionClick}>
                  <Icon icon="actionbutton" size={12} />
                </ActionIcon>
              </Popover.Trigger>
            )}
            <Popover.Content>{actionContent}</Popover.Content>
          </Popover.Provider>
        )}
      </MainWrapper>
      <BottomWrapper isHovered={isHovered || isOpenAction} isSelected={selected}>
        {isEditing ? (
          <StyledTextInput
            value={newName}
            autoFocus
            onChange={handleNameSubmit}
            onBlur={handleEditExit}
            onExit={handleEditExit}
          />
        ) : (
          <StyleName size="footnote" onDoubleClick={handleDoubleClick}>
            {name}
          </StyleName>
        )}
      </BottomWrapper>
    </Wrapper>
  );
};

export default LayerStyleCard;

const Wrapper = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 78px;
  height: 82px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;

  border-color: ${({ selected, theme }) => (selected ? `${theme.select.main}` : "transparent")};
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
`;

const MainWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const BottomWrapper = styled.div<{ isHovered?: boolean; isSelected?: boolean }>`
  height: 20px;
  display: flex;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.3s;

  background: ${({ theme, isHovered, isSelected }) =>
    isSelected ? theme.select.main : isHovered ? theme.bg[2] : "transparent"};
`;

const ActionIcon = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${({ theme }) => theme.content.weak};
  border-radius: 4px;

  :hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const StyleName = styled(Text)`
  padding-left: 2px;
  padding-right: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTextInput = styled(TextInput)`
  width: 100%;
  font-size: 12px;
  color: ${({ theme }) => theme.content.main};
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;
