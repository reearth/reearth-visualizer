import { ReactNode, useCallback, useMemo, useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

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
};

const BlockWrapper: React.FC<Props> = ({ title, icon, padding, isSelected, children, onClick }) => {
  const [isHovered, setHover] = useState(false);

  const handleStopPropagation = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  const actionItems = useMemo(
    () => [
      {
        blockName: title ?? "Story Block",
        icon: icon ?? "plugin",
      },
      {
        icon: "settings",
        hide: !isSelected,
        onClick: () => console.log("SETTINGS"),
      },
      {
        icon: "settings",
        hide: !isSelected,
        onClick: () => console.log("SETTINGS 2"),
      },
    ],
    [title, icon, isSelected],
  );

  const handleMouseEnter = useCallback(() => {
    setHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      isSelected={isSelected}>
      {(isHovered || isSelected) && (
        <ActionPanel isSelected={isSelected}>
          <Icon icon="dndHandle" size={16} />
          <BlockOptions isSelected={isSelected} onClick={handleStopPropagation}>
            {actionItems.map(
              (a, idx) =>
                !a.hide && (
                  <OptionWrapper key={idx} onClick={a.onClick}>
                    <OptionIcon icon={a.icon} size={16} showPointer={!!a.onClick} />
                    {a.blockName && (
                      <OptionText size="footnote" customColor>
                        {a.blockName}
                      </OptionText>
                    )}
                  </OptionWrapper>
                ),
            )}
          </BlockOptions>
        </ActionPanel>
      )}
      <Block padding={padding}>{children}</Block>
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

const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const OptionText = styled(Text)`
  margin-right: 4px;
`;

const OptionIcon = styled(Icon)<{ showPointer?: boolean }>`
  padding: 4px;
  border-left: 1px solid #f1f1f1;
  ${({ showPointer }) => showPointer && "cursor: pointer;"}
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
