import { Icon, IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

export type TabItem = {
  id: string;
  name?: string;
  icon?: IconName;
  children?: ReactNode;
};

export type TabsProps = {
  tabs: TabItem[];
  position?: "top" | "left";
  tabStyle?: "normal" | "separated";
  alignment?: "start" | "end" | "center";
  background?: string;
  currentTab?: string;
  noPadding?: boolean;
  onChange?: (tab: string) => void;
};

export const Tabs: FC<TabsProps> = ({
  tabs,
  position = "top",
  tabStyle = "normal",
  background,
  currentTab,
  alignment,
  noPadding,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState(currentTab ?? tabs[0].id);

  const handleTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab);
      onChange?.(newTab);
    },
    [onChange]
  );

  useEffect(() => {
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab]);

  const theme = useTheme();

  const selectedTabItem = useMemo(() => {
    return tabs.find(({ id }) => id === activeTab);
  }, [activeTab, tabs]);

  return (
    <Wrapper position={position} background={background}>
      <TabsMenu
        position={position}
        tabStyle={tabStyle}
        alignment={alignment}
        background={background}
      >
        {tabs.map(({ id, icon, name }) => (
          <Tab
            key={id}
            onClick={() => handleTabChange?.(id)}
            selected={id === activeTab}
            position={position}
            tabStyle={tabStyle}
          >
            {icon && (
              <Icon
                icon={icon}
                color={
                  id === activeTab ? theme.content.main : theme.content.weak
                }
              />
            )}
            {name && (
              <Typography
                size="body"
                weight="regular"
                color={
                  id === activeTab ? theme.content.main : theme.content.weak
                }
              >
                {name}
              </Typography>
            )}
          </Tab>
        ))}
      </TabsMenu>
      <Content noPadding={noPadding}>
        {selectedTabItem ? selectedTabItem.children : null}
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled("div")<{
  position?: "top" | "left";
  background?: string;
}>(({ position, background, theme }) => ({
  display: "flex",
  flexFlow: position === "top" ? "column nowrap" : "row nowrap",
  background: background || theme.bg[1],
  height: "100%",
  width: "100%"
}));

const TabsMenu = styled("div")<{
  position?: "top" | "left";
  tabStyle?: "normal" | "separated";
  alignment?: string;
  background?: string;
}>(({ position, tabStyle, theme, alignment, background }) => ({
  display: "flex",
  flexFlow: position === "top" ? "row nowrap" : "column nowrap",
  background: background || theme.bg[0],
  padding: tabStyle === "normal" ? " " : theme.spacing.large,
  gap: theme.spacing.micro,
  justifyContent:
    alignment === "end"
      ? "flex-end"
      : alignment === "center"
        ? "center"
        : "flex-start"
}));

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
  borderTopRightRadius:
    position === "top" && tabStyle === "normal" ? theme.radius.small : "",
  borderTopLeftRadius: tabStyle === "normal" ? theme.radius.small : "",
  borderBottomLeftRadius:
    position === "left" && tabStyle === "normal" ? theme.radius.small : ""
}));

const Content = styled("div")<{ noPadding?: boolean }>(
  ({ noPadding, theme }) => ({
    padding: noPadding ? 0 : theme.spacing.normal,
    minHeight: 0,
    flex: 1,
    height: "auto",
    overflowY: "auto"
  })
);
