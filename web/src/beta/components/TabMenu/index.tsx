import { FC, ReactNode, useMemo } from "react";

import Icon from "@reearth/beta/components/Icon";
import Icons from "@reearth/beta/components/Icon/icons";
import { styled, useTheme } from "@reearth/services/theme";

interface TabObject {
  icon: keyof typeof Icons;
  component: ReactNode;
  id: string;
}

export type Props = {
  tabs: TabObject[];
  selectedTab: string;
  onSelectedTabChange: (tab: string) => void;
};

const TabMenu: FC<Props> = ({ tabs, selectedTab, onSelectedTabChange }) => {
  const theme = useTheme();

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
  grid-template-columns: 28px 1fr;
  background: ${({ theme }) => theme.bg[1]};
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
  padding: 12px;
  background: ${({ theme }) => theme.bg[1]};
`;
