import {
  Icon,
  IconName,
  IconProps,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
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
} & Pick<IconProps, "placement" | "tooltipText">;

export type TabsProps = {
  tabs: TabItem[] | [];
  position?: "top" | "left";
  tabStyle?: "normal" | "separated";
  alignment?: "start" | "end" | "center";
  background?: string;
  currentTab?: string;
  noPadding?: boolean;
  noOverflowY?: boolean;
  flexHeight?: boolean;
  menuEdgeGap?: "small";
  onChange?: (tab: string) => void;
  dataTestid?: string;
};

export const Tabs: FC<TabsProps> = ({
  tabs,
  position = "top",
  tabStyle = "normal",
  background,
  currentTab,
  alignment,
  noPadding,
  noOverflowY,
  flexHeight,
  menuEdgeGap,
  onChange,
  dataTestid
}) => {
  const [activeTab, setActiveTab] = useState(currentTab ?? tabs[0]?.id);

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
    <Wrapper
      position={position}
      flexHeight={flexHeight}
      background={background}
      data-testid={dataTestid || "tabs-wrapper"}
    >
      <TabsMenu
        position={position}
        tabStyle={tabStyle}
        alignment={alignment}
        background={background}
        edgeGap={menuEdgeGap}
        role="tablist"
        data-testid="tabs-menu"
      >
        {tabs.map(({ id, icon, name, tooltipText, placement }) => (
          <Tab
            key={id}
            onClick={() => handleTabChange?.(id)}
            selected={id === activeTab}
            position={position}
            tabStyle={tabStyle}
            role="tab"
            aria-selected={id === activeTab}
            data-testid={`tab-${id}`}
          >
            {icon && (
              <Icon
                tooltipText={tooltipText}
                icon={icon}
                placement={placement}
                aria-hidden="true"
                color={
                  id === activeTab ? theme.content.main : theme.content.weak
                }
                data-testid={`tab-icon-${id}`}
              />
            )}
            {name && (
              <Typography
                size="body"
                weight="regular"
                color={
                  id === activeTab ? theme.content.main : theme.content.weak
                }
                data-testid={`tab-name-${id}`}
              >
                {name}
              </Typography>
            )}
          </Tab>
        ))}
      </TabsMenu>
      {selectedTabItem && selectedTabItem.children && (
        <Content
          noPadding={noPadding}
          noOverflowY={noOverflowY}
          role="tabpanel"
          data-testid="tabs-content"
        >
          {selectedTabItem.children}
        </Content>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{
  position?: "top" | "left";
  background?: string;
  flexHeight?: boolean;
}>(({ position, background, flexHeight, theme }) => ({
  display: css.display.flex,
  flexFlow: position === "top" ? "column nowrap" : "row nowrap",
  background: background || theme.bg[1],
  height: flexHeight ? "auto" : "100%",
  width: "100%",
  ...(flexHeight && { minHeight: 0, flex: 1 })
}));

const TabsMenu = styled("div")<{
  position?: "top" | "left";
  tabStyle?: "normal" | "separated";
  alignment?: string;
  background?: string;
  edgeGap?: "small";
}>(({ position, tabStyle, theme, alignment, background, edgeGap }) => ({
  display: css.display.flex,
  flexFlow: position === "top" ? "row nowrap" : "column nowrap",
  background: background || theme.bg[0],
  padding:
    tabStyle === "normal"
      ? edgeGap
        ? position === "top"
          ? `0 ${theme.spacing[edgeGap]}px`
          : `${theme.spacing[edgeGap]}px 0`
        : " "
      : theme.spacing.large,
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
  display: css.display.flex,
  alignItems: css.alignItems.center,
  cursor: css.cursor.pointer,
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

const Content = styled("div")<{
  noPadding?: boolean;
  noOverflowY?: boolean;
}>(({ noPadding, noOverflowY, theme }) => ({
  padding: noPadding ? 0 : theme.spacing.normal,
  minHeight: 0,
  flex: 1,
  height: "auto",
  overflowY: noOverflowY ? "hidden" : "auto",
  display: css.display.flex,
  flexDirection: css.flexDirection.column
}));
