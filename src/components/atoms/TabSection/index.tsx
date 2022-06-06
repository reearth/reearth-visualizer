import React, { useEffect, useState } from "react";

import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

import Divider from "../Divider";

export type MenuAlignment = "left" | "top";

export interface Props<T extends string> {
  className?: string;
  children?: { [m in T]?: React.ReactNode };
  headerAction?: React.ReactNode;
  menuAlignment?: MenuAlignment;
  scrollable?: boolean;
  expandedMenuIcon?: boolean;
  selected?: T;
  initialSelected?: T;
  onChange?: (m: T) => void;
  headers?: { [m in T]?: string };
}
const TabSection = <T extends string>({
  className,
  children,
  headerAction,
  menuAlignment,
  scrollable,
  selected,
  onChange,
  initialSelected,
  headers,
}: Props<T>) => {
  const tabs: T[] = (Object.keys(children || {}) as T[]).filter(k => !!children?.[k]);
  const [selectedTab, select] = useState<T | undefined>(initialSelected ?? tabs?.[0]);
  useEffect(() => {
    select(selected);
  }, [selected]);

  const theme = useTheme();

  return (
    <Wrapper className={className} menuAlignment={menuAlignment}>
      <TabHeader>
        {tabs?.map((m: T) => (
          <TabTitle
            key={m}
            selected={selectedTab === m}
            onClick={() => {
              select(m);
              onChange?.(m);
            }}>
            <Text size="m" color={selectedTab === m ? theme.main.select : theme.main.text}>
              {headers?.[m] ?? m}
            </Text>
          </TabTitle>
        ))}
        {<ActionWrapper expanded={true}>{headerAction}</ActionWrapper>}
      </TabHeader>
      <Divider margin="0" />
      <TabContent scrollable={scrollable}>
        {selectedTab ? children?.[selectedTab] ?? null : null}
      </TabContent>
    </Wrapper>
  );
};
const Wrapper = styled.div<{ menuAlignment?: MenuAlignment }>`
  display: flex;
  flex-flow: ${({ menuAlignment }) => (menuAlignment === "top" ? "column" : "row")} nowrap;
  justify-content: stretch;
  position: relative;
`;
const TabHeader = styled.div<{ menuAlignment?: MenuAlignment }>`
  display: flex;
  flex-flow: ${({ menuAlignment }) => (menuAlignment === "top" ? "column" : "row")} nowrap;
  align-items: space-between;
  gap: 24px;
  padding: 0px;
  width: 100%;
  height: 100%;
`;

const TabTitle = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  user-select: none;
  border-bottom: 2px solid ${({ selected, theme }) => (selected ? theme.main.select : "none")};
  opacity: ${({ selected }) => (selected ? "1" : "0.7")};
`;

const ActionWrapper = styled.div<{ expanded?: boolean }>`
  flex: ${props => (props.expanded ? "1" : null)};
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  margin-block-start: -13px;
`;
const TabContent = styled.div<{ scrollable?: boolean }>`
  flex: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  overflow-x: hidden;
  overflow-y: ${({ scrollable }) => (scrollable ? "auto" : "hidden")};
  -webkit-overflow-scrolling: touch;
`;

export default TabSection;
