import { FC, ReactNode, useMemo } from "react";

import { Icon, IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

export type TabItems = {
  id: string;
  name?: string;
  icon?: IconName;
  children?: ReactNode;
};

export type TabsProps = {
  tabs: TabItems[];
  position?: "top" | "left";
  tabStyle?: "normal" | "separated";
  activeTab?: string;
  onChange?: (tab: string) => void;
};

export const Tabs: FC<TabsProps> = ({
  tabs,
  position = "top",
  tabStyle = "normal",
  activeTab,
  onChange,
}) => {
  const theme = useTheme();
  const selectedTabItem = useMemo(() => {
    return tabs.find(({ id }) => id === activeTab);
  }, [activeTab, tabs]);

  return (
    <Wrapper position={position}>
      <TabsMenu position={position} tabStyle={tabStyle}>
        {tabs.map(({ id, icon, name }) => (
          <Tab
            key={id}
            onClick={() => onChange?.(id)}
            selected={id === activeTab}
            position={position}
            tabStyle={tabStyle}>
            {icon && (
              <Icon
                icon={icon}
                color={id === activeTab ? theme.content.main : theme.content.weak}
              />
            )}
            {name && (
              <Typography
                size="body"
                weight="regular"
                color={id === activeTab ? theme.content.main : theme.content.weak}>
                {name}
              </Typography>
            )}
          </Tab>
        ))}
      </TabsMenu>
      <Content>{selectedTabItem ? selectedTabItem.children : null}</Content>
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ position?: "top" | "left" }>(({ position, theme }) => ({
  display: "flex",
  flexFlow: position === "top" ? "column nowrap" : "row nowrap",
  background: theme.bg[1],
  height: "100%",
}));

const TabsMenu = styled("div")<{ position?: "top" | "left"; tabStyle?: "normal" | "separated" }>(
  ({ position, tabStyle, theme }) => ({
    display: "flex",
    flexFlow: position === "top" ? "row nowrap" : "column nowrap",
    background: theme.bg[0],
    padding: tabStyle === "normal" ? " " : theme.spacing.large,
    gap: theme.spacing.micro,
  }),
);

const Tab = styled("div")<{
  position?: "top" | "left";
  selected: boolean;
  tabStyle?: "normal" | "separated";
}>(({ position, selected, tabStyle, theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  gap: theme.spacing.smallest,
  background: selected ? theme.bg[1] : "inherit",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: tabStyle === "separated" ? theme.radius.small : 0,
  borderTopRightRadius: position === "top" && tabStyle === "normal" ? theme.radius.small : "",
  borderTopLeftRadius: position === "top" && tabStyle === "normal" ? theme.radius.small : "",
}));

const Content = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  height: "auto",
}));
