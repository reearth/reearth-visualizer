import { FC, useMemo } from "react";

import Icon from "@reearth/beta/components/Icon";
import Icons from "@reearth/beta/components/Icon/icons";
import { styled } from "@reearth/services/theme";

import Text from "../Text";

export type TabObject = {
  id: string;
  name?: string;
  icon: keyof typeof Icons;
  component?: JSX.Element;
};

export type Props = {
  tabs: TabObject[];
  selectedTab: string;
  onSelectedTabChange: (tab: string) => void;
};

const TabMenu: FC<Props> = ({ tabs, selectedTab, onSelectedTabChange }) => {
  const selectedTabItem = useMemo(() => {
    return tabs.find(({ id }) => id === selectedTab);
  }, [selectedTab, tabs]);

  return (
    <Wrapper>
      <Tabs>
        {tabs.map(({ id, icon }) => (
          <TabIconWrapper
            key={id}
            onClick={() => onSelectedTabChange(id)}
            selected={id === selectedTab}>
            <Icon icon={icon} alt={"Tab " + id} size={20} />
          </TabIconWrapper>
        ))}
      </Tabs>
      <MainArea>
        {selectedTabItem?.name && (
          <Header>
            <Text size="body">{selectedTabItem.name}</Text>
          </Header>
        )}
        {selectedTabItem ? selectedTabItem.component : null}
      </MainArea>
    </Wrapper>
  );
};

export default TabMenu;

const Wrapper = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: 28px 1fr;
  background: ${({ theme }) => theme.bg[1]};
`;

const Tabs = styled.div`
  padding-top: 4px;
  grid-column: 1/2;
  background: ${({ theme }) => theme.bg[0]};
`;

const TabIconWrapper = styled.div<{ selected: boolean }>`
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ selected, theme }) => (selected ? theme.content.main : theme.content.weak)};
  background: ${props => (props.selected ? props.theme.bg[1] : "inherit")};
`;

const Header = styled.div`
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
`;

const MainArea = styled.div`
  grid-column: 2/-1;
  display: block;
  padding: 12px;
  background: ${({ theme }) => theme.bg[1]};
`;
