import Navbar from "@reearth/beta/features/Navbar";
import {
  DEFAULT_SIDEBAR_WIDTH,
  SidebarMenuItem,
  SidebarSection,
  SidebarVersion,
  SidebarWrapper
} from "@reearth/beta/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";
import { useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useMemo } from "react";

type Props = {
  tab: string;
  workspaceId?: string;
  children: ReactNode;
};

export const accountSettingTabs = [
  { id: "account", text: "Account", icon: "user", path: "/settings/account" },
  {
    id: "workspaces",
    text: "Workspaces",
    icon: "usersFour",
    path: "/settings/workspaces/:workspaceId"
  }
  // TODO: enable these when page ready
  // {
  //   id: "members",
  //   text: "Members",
  //   icon: "users",
  //   path: "/settings/workspaces/:workspaceId/members"
  // }
] as const;

const AccountSettingBase: FC<Props> = ({ tab, children, workspaceId }) => {
  const t = useT();
  const [currentWorkspace] = useWorkspace();
  const tabs = useMemo(
    () =>
      accountSettingTabs.map((tab) => ({
        id: tab.id,
        icon: tab.icon,
        text: t(tab.text),
        path: tab.path.replace(
          ":workspaceId",
          workspaceId || currentWorkspace?.id || ""
        )
      })),
    [workspaceId, t, currentWorkspace?.id]
  );

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

export default AccountSettingBase;
