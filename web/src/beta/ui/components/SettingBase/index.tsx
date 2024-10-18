import Navbar from "@reearth/beta/features/Navbar";
import { IconName } from "@reearth/beta/lib/reearth-ui";
import {
  DEFAULT_SIDEBAR_WIDTH,
  SidebarMenuItem,
  SidebarSection,
  SidebarVersion,
  SidebarWrapper
} from "@reearth/beta/ui/components/Sidebar";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

type Props = {
  tab: string;
  tabs: {
    id: string;
    text?: string;
    icon?: IconName;
    path?: string;
    disabled?: boolean;
  }[];
  workspaceId?: string;
  children: ReactNode;
};

const SettingBase: FC<Props> = ({ tabs, tab, children, workspaceId }) => {
  return (
    <Wrapper>
      <Navbar page="settings" workspaceId={workspaceId} />
      <MainSection>
        <LeftSidePanel>
          <SidebarWrapper>
            <SidebarSection>
              {tabs?.map((t) => (
                <SidebarMenuItem
                  key={t.id}
                  path={t.path}
                  text={t.text}
                  active={t.id === tab}
                  icon={t.icon}
                  disabled={t.disabled}
                />
              ))}
            </SidebarSection>
            <SidebarVersion />
          </SidebarWrapper>
        </LeftSidePanel>
        <Content>{children}</Content>
      </MainSection>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  color: theme.content.main,
  backgroundColor: theme.bg[0],
  ["*"]: {
    boxSizing: "border-box"
  },
  ["* ::-webkit-scrollbar"]: {
    width: "8px"
  },
  ["* ::-webkit-scrollbar-track"]: {
    background: theme.relative.darker,
    borderRadius: theme.radius.large
  },
  ["* ::-webkit-scrollbar-thumb"]: {
    background: theme.relative.light,
    borderRadius: theme.radius.small
  },
  ["* ::-webkit-scrollbar-thumb:hover"]: {
    background: theme.relative.lighter
  }
}));

const MainSection = styled("div")(() => ({
  display: "flex",
  flex: 1,
  overflow: "auto",
  position: "relative"
}));

const LeftSidePanel = styled("div")(({ theme }) => ({
  width: DEFAULT_SIDEBAR_WIDTH,
  height: "100%",
  backgroundColor: theme.bg[1],
  display: "flex",
  padding: `${theme.spacing.large}px 0`,
  boxSizing: "border-box"
}));

const Content = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  alignItems: "center",
  overflow: "auto",
  padding: `${theme.spacing.super}px`
}));

export default SettingBase;
