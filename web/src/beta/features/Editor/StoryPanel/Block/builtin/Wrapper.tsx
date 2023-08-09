import { Fragment, ReactNode, useCallback, useMemo, useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Template from "../Template";

type Spacing = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type Props = {
  title?: string;
  icon?: string;
  padding?: Spacing;
  isSelected?: boolean;
  children?: ReactNode;
  onClick: (() => void) | undefined;
  onRemove?: () => void;
};

const BlockWrapper: React.FC<Props> = ({
  title,
  icon,
  padding,
  isSelected,
  children,
  onClick,
  onRemove,
}) => {
  const t = useT();
  const [isHovered, setHover] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPadding, setShowPadding] = useState(false);

  const handleEditModeToggle = useCallback(() => setEditMode(em => !em), []);

  const handleSettingsToggle = useCallback(() => setShowSettings(s => !s), []);

  const handleMouseEnter = useCallback(() => setHover(true), []);

  const handleMouseLeave = useCallback(() => setHover(false), []);

  const handleBlockRemove = useCallback(() => onRemove?.(), [onRemove]);

  const handleBlockClick = useCallback(() => {
    if (showSettings && isSelected) return;
    onClick?.();
  }, [onClick, showSettings, isSelected]);

  const actionItems = useMemo(
    () => [
      {
        blockName: title ?? "Story Block",
        icon: icon ?? "plugin",
      },
      {
        icon: editMode ? "exit" : "storyBlockEdit",
        hide: !isSelected,
        onClick: handleEditModeToggle,
      },
      {
        icon: "settings",
        hide: !isSelected,
        onClick: handleSettingsToggle,
      },
    ],
    [title, icon, isSelected, editMode, handleEditModeToggle, handleSettingsToggle],
  );

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      isSelected={isSelected}>
      {(isHovered || isSelected) && (
        <ActionPanel isSelected={isSelected}>
          <Icon icon="dndHandle" size={16} />
          <Popover.Provider
            open={showSettings}
            onOpenChange={handleSettingsToggle}
            placement="bottom-start">
            <BlockOptions isSelected={isSelected}>
              {actionItems.map(
                (a, idx) =>
                  !a.hide && (
                    <Fragment key={idx}>
                      <Popover.Trigger asChild>
                        <OptionWrapper showPointer={!isSelected || !!a.onClick} onClick={a.onClick}>
                          <OptionIcon icon={a.icon} size={16} />
                          {a.blockName && (
                            <OptionText size="footnote" customColor>
                              {a.blockName}
                            </OptionText>
                          )}
                        </OptionWrapper>
                      </Popover.Trigger>
                    </Fragment>
                  ),
              )}
            </BlockOptions>
            <Popover.Content>
              {showPadding ? (
                <SettingsDropdown>
                  <SettingsHeading>
                    <Text size="footnote" customColor>
                      Padding settings
                    </Text>
                    <CancelIcon icon="cancel" size={14} onClick={() => setShowPadding(false)} />
                  </SettingsHeading>
                  <SettingsContent>Padding</SettingsContent>
                </SettingsDropdown>
              ) : (
                <PopoverMenuContent
                  size="sm"
                  items={[
                    {
                      name: t("Padding settings"),
                      icon: "padding",
                      onClick: () => setShowPadding(true),
                    },
                    {
                      name: t("Remove"),
                      icon: "trash",
                      onClick: handleBlockRemove,
                    },
                  ]}
                />
              )}
            </Popover.Content>
          </Popover.Provider>
        </ActionPanel>
      )}
      <Block padding={padding} onClick={handleBlockClick}>
        {children ?? <Template icon={icon} />}
      </Block>
      {editMode && (
        <EditorPanel>
          <p>Block editing</p>
        </EditorPanel>
      )}
    </Wrapper>
  );
};

export default BlockWrapper;

const Wrapper = styled.div<{ isSelected?: boolean }>`
  border-width: 1px;
  border-style: solid;
  border-color: ${({ isSelected, theme }) => (isSelected ? theme.select.main : "transparent")};
  transition: all 0.3s;
  padding: 1px;
  position: relative;

  :hover {
    border-color: ${({ isSelected, theme }) => !isSelected && theme.select.weaker};
  }
`;

const ActionPanel = styled.div<{ isSelected?: boolean }>`
  color: ${({ theme }) => theme.select.main};
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  position: absolute;
  right: -1px;
  top: -25px;
  transition: all 0.2s;
`;

const BlockOptions = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) => (isSelected ? theme.select.main : "transparent")};
  color: ${({ isSelected, theme }) => (isSelected ? theme.content.main : theme.select.main)};
  display: flex;
  align-items: center;
  height: 24px;
  transition: all 0.2s;
`;

const OptionWrapper = styled.div<{ showPointer?: boolean }>`
  display: flex;
  align-items: center;
  ${({ showPointer }) => showPointer && "cursor: pointer;"}
`;

const OptionText = styled(Text)`
  padding-right: 4px;
`;

const OptionIcon = styled(Icon)`
  padding: 4px;
  border-left: 1px solid #f1f1f1;
`;

const Block = styled.div<{ padding?: Spacing }>`
  display: flex;
  min-height: 255px;
  padding-top: ${({ padding }) => padding?.top + "px" ?? 0};
  padding-bottom: ${({ padding }) => padding?.bottom + "px" ?? 0};
  padding-left: ${({ padding }) => padding?.left + "px" ?? 0};
  padding-right: ${({ padding }) => padding?.right + "px" ?? 0};
  cursor: pointer;
`;

const EditorPanel = styled.div`
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  height: 100px;
  padding: 12px;
  position: absolute;
  top: 100%;
  left: -1px;
  right: -1px;
`;

const SettingsDropdown = styled.div`
  z-index: 999;
  background: ${({ theme }) => theme.bg[1]};
  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.bg[3]};
`;

const SettingsHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
  height: 28px;
  padding: 0 8px;
`;

const SettingsContent = styled.div`
  height: 100px;
  width: 200px;
`;

const CancelIcon = styled(Icon)`
  cursor: pointer;
`;
