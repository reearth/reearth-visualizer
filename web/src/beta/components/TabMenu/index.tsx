import { FC, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import Icons from "@reearth/beta/components/Icon/icons";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

interface TabObject {
  icon: keyof typeof Icons;
  component: ReactNode;
  id: string;
  title: string;
}

type Props = {
  tabs: TabObject[];
  selectedTab: string;
  onSelectedTabChange: (tab: string) => void;
};

const TabMenu: FC<Props> = ({ tabs, selectedTab, onSelectedTabChange }) => {
  const theme = useTheme();

  const selectedTabItem = tabs.find(({ id }) => id === selectedTab);

  return (
    <Wrapper>
      <Title>
        <Text size="body">{selectedTabItem ? selectedTabItem.title : "Select a tab"}</Text>
      </Title>
      <Tabs>
        {tabs.map(({ id, icon }) => (
          <TabIconWrapper
            key={id}
            onClick={() => onSelectedTabChange(id)}
            selected={id === selectedTab}>
            <Icon icon={icon} alt={"Tab " + id} size={20} color={theme.content.main} />
          </TabIconWrapper>
        ))}
      </Tabs>
      <MainArea>{selectedTabItem ? selectedTabItem.component : null}</MainArea>
    </Wrapper>
  );
};

export default TabMenu;

const Wrapper = styled.div`
  display: grid;
  border-radius: 10px;
  height: 100%;
  grid-template-rows: 36px 1fr;
  grid-template-columns: 28px 1fr;
  background: ${({ theme }) => theme.bg[2]};
`;

const Title = styled.div`
  grid-column: 1/-1;
  align-self: center;
  padding: 0 6px;
  border-radius: 15px 15px 0 0;
`;

const Tabs = styled.div`
  grid-column: 1/2;
  background: ${({ theme }) => theme.bg[0]};
`;

const TabIconWrapper = styled.div<{ selected: boolean }>`
  padding: 8px 0;
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
  background: ${props => (props.selected ? props.theme.bg[1] : "inherit")};
`;

const MainArea = styled.div`
  grid-column: 2/-1;
  display: block;
  padding: 6px;
  background: ${({ theme }) => theme.bg[1]};
`;
