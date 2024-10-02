import {
  DEFAULT_SIDEBAR_WIDTH,
  SidebarMenuItem,
  SidebarSection,
  SidebarVersion,
  SidebarWrapper
} from "@reearth/beta/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import Navbar from "../Navbar";

import useHook from "./hooks";
import AccountSetting from "./innerPages/AccountSetting";

type Props = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
  tab: string;
};

export const accountSettingTabs = [
  { id: "account", text: "Account", icon: "user" }
  // TODO: enable these when page ready
  // { id: "workspace", text: "Workspace", icon: "users" },
  // { id: "members", text: "Members", icon: "usersFour" }
] as const;

const AccountAndWorkSpaceSetting: FC<Props> = ({ tab }) => {
  const t = useT();
  const tabs = useMemo(
    () =>
      accountSettingTabs.map((tab) => ({
        id: tab.id,
        icon: tab.icon,
        text: t(tab.text),
        path: `/settings/${tab.id}`
      })),
    [t]
  );
  const { meData, passwordPolicy, handleUpdateUserPassword } = useHook();
  const { name, email } = meData;

  return (
    <Wrapper>
      <Navbar workspaceId={meData.myTeam?.id} page="settings" />
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
        <Content>
          {tab === "account" && (
            <AccountSetting
              onUpdateUserPassword={handleUpdateUserPassword}
              passwordPolicy={passwordPolicy}
              informationData={{ name, email }}
            />
          )}
        </Content>
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

export default AccountAndWorkSpaceSetting;
