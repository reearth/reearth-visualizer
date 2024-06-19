import { FC } from "react";

import { IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { DashboardProps } from "..";

import useHooks from "./hooks";
import { Menu } from "./menuItem";
import { Profile } from "./profile";

export type TabItems = {
  id: string;
  text?: string;
  icon?: IconName;
  path?: string;
  active?: boolean;
};

export const tabsItem: Omit<TabItems[], "active"> = [
  { id: "project", text: "Project", icon: "grid" },
  { id: "asset", text: "Assets", icon: "file" },
  { id: "members", text: "Members", icon: "appearance" },
  { id: "bin", text: "Recycle bin", icon: "trash" },
  { id: "plugin", text: "Plugin Playgroung", icon: "puzzlePiece", path: " " },
  { id: "documentary", text: "Documentary", icon: "book", path: " " },
  { id: "community", text: "Community", icon: "usersFour", path: " " },
  { id: "help", text: "Help & Support", icon: "question", path: " " },
] as const;

const LeftSidePanel: FC<DashboardProps> = ({ workspaceId, tab: currentTab }) => {
  const t = useT();
  const theme = useTheme();

  const {
    isPersonal,
    currentWorkspace,
    workspaces,
    topTabs,
    bottomTabs,
    onSignOut,
    handleWorkspaceChange,
  } = useHooks({ tabsItem, workspaceId });

  return (
    <Wrapper>
      <Section>
        <Profile
          currentUser={currentWorkspace?.name}
          isPersonal={isPersonal}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          onSignOut={onSignOut}
          onWorkspaceChange={handleWorkspaceChange}
        />
        <>
          {topTabs.map(tab => (
            <Menu
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
            />
          ))}
        </>
      </Section>
      <Section>
        <>
          {bottomTabs.map(tab => (
            <Menu
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
            />
          ))}
        </>
        <Version>
          <Typography size="body" color={theme.content.weak}>
            {t("Version 1.0 LTS")}
          </Typography>
        </Version>
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: `0 ${theme.spacing.smallest}px`,
  flex: 1,
  justifyContent: "space-between",
}));

const Section = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
}));

const Version = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
}));

export default LeftSidePanel;
