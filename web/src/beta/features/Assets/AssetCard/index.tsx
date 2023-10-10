import { Placement } from "@floating-ui/react";
import React, { ReactNode, useState, useCallback } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

import { AppearanceNameUpdateProps } from "../../Editor/useAppearances";

export type Props = {
  id?: string;
  className?: string;
  name: string;
  url?: string;
  icon?: string;
  iconSize?: string;
  checked?: boolean;
  selected?: boolean;
  actionContent?: ReactNode;
  isNameEditable?: boolean;
  actionPlacement?: Placement;
  onSelect?: (selected: boolean) => void;
  onActionClick?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  onAppearanceNameUpdate?: (inp: AppearanceNameUpdateProps) => void;
};

const AssetCard: React.FC<Props> = ({
  id,
  className,
  name,
  url,
  icon,
  iconSize,
  checked,
  selected,
  actionContent,
  isNameEditable = false,
  actionPlacement,
  onSelect,
  onActionClick,
  onOpenChange,
  onAppearanceNameUpdate,
}) => {
  const [isOpenAction, setIsOpenAction] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsOpenAction(false);
  }, []);

  const handleNameClick = useCallback(() => {
    if (isNameEditable) setIsEditing(true);
  }, [isNameEditable]);

  const handleNameChange = useCallback(
    (newName: string) => {
      isNameEditable && setNewName(newName);
    },
    [isNameEditable],
  );

  const handleNameSubmit = useCallback(() => {
    isNameEditable && setIsEditing(false);
    onAppearanceNameUpdate?.({ styleId: id || "", name: newName });
  }, [id, isNameEditable, newName, onAppearanceNameUpdate]);

  const handleEditExit = useCallback(
    (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (newName !== name && e?.key !== "Escape") handleNameSubmit();
      else setNewName(name);
      setIsEditing(false);
    },
    [handleNameSubmit, name, newName],
  );

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpenAction(!isOpenAction);
    onActionClick?.();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpenAction(isOpen);
    onOpenChange?.(isOpen);
  };

  return (
    <Wrapper
      className={className}
      selected={selected}
      isAppearanceIcon={icon === "appearance"}
      onClick={() => onSelect?.(!selected)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <ImgWrapper>
        {!icon ? <PreviewImage url={url} /> : <Icon icon={icon} size={iconSize} />}
      </ImgWrapper>

      {isEditing ? (
        <StyledTextInput
          value={newName}
          timeout={0}
          autoFocus
          onChange={handleNameChange}
          onBlur={handleEditExit}
          onExit={handleEditExit}
        />
      ) : (
        <FileName size="footnote" onDoubleClick={handleNameClick}>
          {name}
        </FileName>
      )}
      {checked && <StyledIcon icon="checkCircle" alt="checked" size="18px" />}

      {actionContent && (
        <Popover.Provider
          open={isOpenAction}
          placement={actionPlacement}
          onOpenChange={handleOpenChange}>
          {isHovered && (
            <Popover.Trigger asChild>
              <ActionIcon onClick={handleActionClick}>
                <Icon icon="actionbutton" size={12} />
              </ActionIcon>
            </Popover.Trigger>
          )}
          <StyledPopoverContent>{actionContent}</StyledPopoverContent>
        </Popover.Provider>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ selected?: boolean; isAppearanceIcon?: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${({ theme, isAppearanceIcon }) => (isAppearanceIcon ? theme.bg[0] : theme.bg[2])};
  box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.25);
  border: 2px solid ${({ selected, theme }) => (selected ? `${theme.select.main}` : "transparent")};
  padding: ${({ theme }) => theme.spacing.small}px;
  width: 100%;
  max-width: ${({ isAppearanceIcon }) => (isAppearanceIcon ? "calc(148px * 0.7)" : "148px")};
  max-height: ${({ isAppearanceIcon }) => (isAppearanceIcon ? "calc(148px * 0.7)" : "148px")};
  height: 100%;
  position: relative;
  cursor: pointer;
  color: ${({ theme }) => theme.content.main};
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const ImgWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 75px;
`;

const PreviewImage = styled.div<{ url?: string }>`
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.url})`};
  background-size: cover;
  background-position: center;
`;

const FileName = styled(Text)`
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: ${({ theme }) => theme.spacing.small}px;
  color: inherit;
`;

const StyledTextInput = styled(TextInput)`
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  bottom: 7px;
  right: 7px;
  color: ${({ theme }) => theme.select.main};
`;

const ActionIcon = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${({ theme }) => theme.content.weak};

  :hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const StyledPopoverContent = styled(Popover.Content)`
  z-index: 1000;
  position: relative;
`;

export default AssetCard;
