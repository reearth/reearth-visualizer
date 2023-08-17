import { FC, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import Icons from "@reearth/beta/components/Icon/icons";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

interface TabObject {
  icon: keyof typeof Icons;
  component: ReactNode;
  key: string;
}

type Props = {
  title: string;
  tabs: TabObject[];
  selectedTab: string;
  onSelectedTabChange: (tab: string) => void;
};

const TabMenu: FC<Props> = ({ tabs, title, selectedTab, onSelectedTabChange }) => {
  const theme = useTheme();

  const selectedTabItem = tabs.find(({ key }) => key === selectedTab);

  return (
    <Wrapper>
      <Title>
        <Text size="body">{title}</Text>
      </Title>
      <Tabs>
        {tabs.map(({ key, icon }) => (
          <TabIconWrapper
            key={key}
            onClick={() => onSelectedTabChange(key)}
            selected={key === selectedTab}>
            <Icon icon={icon} alt={"Tab " + key} size={20} color={theme.content.main} />
          </TabIconWrapper>
        ))}
      </Tabs>
      <MainArea>{selectedTabItem ? selectedTabItem.component : null}</MainArea>
    </Wrapper>
  );
};

export default TabMenu;

const Wrapper = styled.div`
  width: 286px;
  display: grid;
  border-radius: 10px;
  margin: 15px;
  grid-template-rows: 36px 1fr;
  grid-template-columns: 28px 1fr;
  height: 600px;
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
  cursor: pointer;
`;

const TabIconWrapper = styled.div<{ selected: boolean }>`
  padding: 8px 0;
  width: 100%;
  display: flex;
  justify-content: center;
  background: ${props => (props.selected ? props.theme.bg[1] : "inherit")};
`;

const MainArea = styled.div`
  grid-column: 2/-1;
  display: block;
  padding: 6px;
  background: ${({ theme }) => theme.bg[1]};
`;
