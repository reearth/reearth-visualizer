import React, { useEffect, useState } from "react";
import _ from "lodash";

import { styled, useTheme } from "@reearth/theme";
import Overlay from "@reearth/components/atoms/Overlay";
import Icon from "../Icon";
import Text from "@reearth/components/atoms/Text";

export type MenuAlignment = "left" | "top";

export interface Props<T extends string> {
  className?: string;
  children?: { [mode in T]?: React.ReactNode };
  menuAlignment?: MenuAlignment;
  scrollable?: boolean;
  expandedMenuIcon?: boolean;
  selected?: T;
  initialSelectedMode?: T;
  onChange?: (mode: T) => void;
  disabled?: boolean;
  onlyIcon?: boolean;
  labels?: { [mode in T]?: string };
}

const TabArea = <T extends string>({
  className,
  children,
  menuAlignment,
  scrollable,
  expandedMenuIcon,
  selected,
  onChange,
  initialSelectedMode,
  disabled,
  onlyIcon,
  labels,
}: Props<T>) => {
  const tabs: T[] | undefined = Object.keys(
    _.pickBy(children, value => {
      return !!value;
    }),
  ) as T[];
  const [selectedTab, select] = useState<T | undefined>(initialSelectedMode ?? tabs?.[0]);

  useEffect(() => {
    select(selected);
  }, [selected]);

  const theme = useTheme();
  return (
    <Wrapper className={className} menuAlignment={menuAlignment}>
      <Menu menuAlignment={menuAlignment}>
        {tabs?.map((m: T) => (
          <IconWrapper
            key={m}
            selected={selectedTab === m}
            expanded={expandedMenuIcon}
            onClick={() => {
              select(m);
              onChange?.(m);
            }}>
            <StyledIcon size={18} icon={m} alt={m} />
            {(selectedTab === m || !onlyIcon) && (
              <IconTitle size="xs" color={theme.tabArea.text}>
                {labels?.[m] ?? m}
              </IconTitle>
            )}
          </IconWrapper>
        ))}
      </Menu>
      <Content scrollable={scrollable}>
        {selectedTab ? children?.[selectedTab] ?? null : null}
      </Content>
      <Overlay show={disabled} />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ menuAlignment?: MenuAlignment }>`
  display: flex;
  flex-flow: ${({ menuAlignment }) => (menuAlignment === "top" ? "column" : "row")} nowrap;
  background: ${({ theme }) => theme.leftMenu.bg};
  justify-content: stretch;
  width: 100%;
  height: 100%;
  position: relative;
`;

const Menu = styled.div<{ menuAlignment?: MenuAlignment }>`
  display: flex;
  flex-flow: ${({ menuAlignment }) => (menuAlignment === "top" ? "row" : "column")} nowrap;
  background-color: ${({ theme }) => theme.tabArea.bg};
`;

const IconWrapper = styled.div<{ selected?: boolean; expanded?: boolean }>`
  flex: ${props => (props.expanded ? "1" : null)};
  padding: 8px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  background: ${({ selected, theme }) => (selected ? theme.tabArea.selectedBg : "none")};
  opacity: ${({ selected }) => (selected ? "1" : "0.7")};
`;

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.main.strongText};
`;

const IconTitle = styled(Text)`
  margin: 0 8px;
`;

const Content = styled.div<{ scrollable?: boolean }>`
  flex: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  overflow-x: hidden;
  overflow-y: ${({ scrollable }) => (scrollable ? "auto" : "hidden")};
  -webkit-overflow-scrolling: touch;
`;

export default TabArea;
