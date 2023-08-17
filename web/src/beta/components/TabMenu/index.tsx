import { FC, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import Icons from "@reearth/beta/components/Icon/icons";
import Resizable from "@reearth/beta/components/Resizable";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

import { Direction, Gutter } from "../Resizable/hooks";

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

  const resizableArgs = {
    direction: "vertical" as Direction,
    gutter: "end" as Gutter,
    initialSize: 800,
    minSize: 300,
  };

  return (
    <Resizable {...resizableArgs}>
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
    </Resizable>
  );
};

export default TabMenu;

const Wrapper = styled.div`
  display: grid;
  border-radius: 10px;
  margin: 15px;
  grid-template-rows: 36px 1fr;
  grid-template-columns: 28px 1fr;
  min-height: 100vh;
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
