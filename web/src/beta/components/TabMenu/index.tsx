import Icon from "@reearth/beta/components/Icon";
import Icons from "@reearth/beta/components/Icon/icons";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import Text from "../Text";

type menuAlignment = "top" | "left";

export type TabObject = {
  id: string;
  name?: string;
  icon?: keyof typeof Icons;
  component?: JSX.Element;
};

export type Props = {
  tabs: TabObject[];
  selectedTab: string;
  scrollable?: boolean;
  onSelectedTabChange: (tab: string) => void;
  menuAlignment?: menuAlignment;
};

const TabMenu: FC<Props> = ({
  tabs,
  selectedTab,
  scrollable,
  onSelectedTabChange,
  menuAlignment
}) => {
  const selectedTabItem = useMemo(() => {
    return tabs.find(({ id }) => id === selectedTab);
  }, [selectedTab, tabs]);

  return (
    <Wrapper menuAlignment={menuAlignment}>
      <Tabs menuAlignment={menuAlignment}>
        {tabs.map(({ id, icon, name }) => (
          <TabIconWrapper
            key={id}
            onClick={() => onSelectedTabChange(id)}
            selected={id === selectedTab}
            menuAlignment={menuAlignment}
          >
            {icon ? (
              <Icon icon={icon} size={20} />
            ) : (
              <TabHeader size="footnote">{name}</TabHeader>
            )}
          </TabIconWrapper>
        ))}
      </Tabs>
      <MainArea scrollable={scrollable}>
        {selectedTabItem?.name && !menuAlignment && (
          <Header>
            <Text size="body">{selectedTabItem.name}</Text>
          </Header>
        )}
        <Content>{selectedTabItem ? selectedTabItem.component : null}</Content>
      </MainArea>
    </Wrapper>
  );
};

export default TabMenu;

const Wrapper = styled.div<{ menuAlignment?: menuAlignment }>`
  display: ${({ menuAlignment }) =>
    menuAlignment === "top" ? "flex" : "grid"};
  grid-template-columns: 28px 1fr;
  flex-flow: column nowrap;
  position: relative;
  background: ${({ theme }) => theme.bg[1]};
  height: 100%;
`;

const Tabs = styled.div<{ menuAlignment?: menuAlignment }>`
  display: flex;
  flex-flow: ${({ menuAlignment }) =>
      menuAlignment === "top" ? "row" : "column"}
    nowrap;
  padding-top: 4px;
  background: ${({ theme }) => theme.bg[0]};
`;

const TabIconWrapper = styled.div<{
  selected: boolean;
  menuAlignment?: menuAlignment;
}>`
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ selected, theme }) =>
    selected ? theme.content.main : theme.content.weak};
  background: ${(props) => (props.selected ? props.theme.bg[1] : "inherit")};
  border-top-right-radius: ${({ menuAlignment }) =>
    menuAlignment === "top" ? "4px" : "0"};
  border-top-left-radius: ${({ menuAlignment }) =>
    menuAlignment === "top" ? "4px" : "0"};
`;

const TabHeader = styled(Text)`
  padding: 4px;
`;

const Header = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
`;

const MainArea = styled.div<{ scrollable?: boolean }>`
  display: block;
  height: auto;
  overflow-y: ${({ scrollable }) => (scrollable ? "auto" : "unset")};
`;

const Content = styled.div`
  padding: 12px;
`;
