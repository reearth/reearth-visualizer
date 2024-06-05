import { FC, ReactNode, useMemo } from "react";

import { Icon, IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

export type TabItems = {
  id: string;
  name?: string;
  icon?: IconName;
  disables?: boolean;
  children?: ReactNode;
};

export type TabsProps = {
  tabs: TabItems[];
  position?: "top" | "left";
  activeTab?: string;
  onChange?: (tab: string) => void;
};

export const Tabs: FC<TabsProps> = ({ tabs, position = "top", activeTab, onChange }) => {
  const theme = useTheme();
  const selectedTabItem = useMemo(() => {
    return tabs.find(({ id }) => id === activeTab);
  }, [activeTab, tabs]);

  return (
    <Wrapper position={position}>
      <TabsMenu position={position}>
        {tabs.map(({ id, icon, name }) => (
          <Tab
            key={id}
            onClick={() => onChange?.(id)}
            selected={id === activeTab}
            position={position}>
            {icon && <Icon icon={icon} />}
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
}));

const TabsMenu = styled("div")<{ position?: "top" | "left" }>(({ position, theme }) => ({
  display: "flex",
  flexFlow: position === "top" ? "row nowrap" : "column nowrap",
  background: theme.bg[0],
  padding: position === "top" ? " " : theme.spacing.large,
  gap: theme.spacing.micro,
  borderRight: position === "top" ? "none" : `1px solid ${theme.outline.weak}`,
}));

const Tab = styled("div")<{ position?: "top" | "left"; selected: boolean }>(
  ({ position, selected, theme }) => ({
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: theme.spacing.smallest,
    background: selected ? theme.bg[1] : "inherit",
    padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    borderRadius: position === "top" ? 0 : theme.radius.small,
    borderTopRightRadius: position === "top" ? theme.radius.small : "",
    borderTopLeftRadius: position === "top" ? theme.radius.small : "",
  }),
);

const Content = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  display: "block",
  height: "auto",
}));
