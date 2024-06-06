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
  activeTab?: string;
  iconOnly?: boolean;
  onChange?: (tab: string) => void;
};

export const Tabs: FC<TabsProps> = ({ tabs, position = "top", activeTab, iconOnly, onChange }) => {
  const theme = useTheme();
  const selectedTabItem = useMemo(() => {
    return tabs.find(({ id }) => id === activeTab);
  }, [activeTab, tabs]);

  return (
    <Wrapper position={position}>
      <TabsMenu position={position} iconOnly={iconOnly}>
        {tabs.map(({ id, icon, name }) => (
          <Tab
            key={id}
            onClick={() => onChange?.(id)}
            selected={id === activeTab}
            iconOnly={iconOnly}
            position={position}>
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

const TabsMenu = styled("div")<{ position?: "top" | "left"; iconOnly?: boolean }>(
  ({ position, iconOnly, theme }) => ({
    display: "flex",
    flexFlow: position === "top" ? "row nowrap" : "column nowrap",
    background: theme.bg[0],
    padding: position === "left" && !iconOnly ? theme.spacing.large : " ",
    gap: theme.spacing.micro,
    borderRight: position === "left" && !iconOnly ? `1px solid ${theme.outline.weak}` : "none",
  }),
);

const Tab = styled("div")<{ position?: "top" | "left"; selected: boolean; iconOnly?: boolean }>(
  ({ position, selected, iconOnly, theme }) => ({
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: theme.spacing.smallest,
    background: selected ? theme.bg[1] : "inherit",
    padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    borderRadius: position === "left" && !iconOnly ? theme.radius.small : 0,
    borderTopRightRadius: position === "top" ? theme.radius.small : "",
    borderTopLeftRadius: position === "top" ? theme.radius.small : "",
  }),
);

const Content = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  height: "auto",
}));
