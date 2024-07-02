import { FC } from "react";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import ContentsContainer from "./ContentsContainer";
import useHooks from "./hooks";
import LeftSidePanel from "./LeftSidePanel";
import { TabItems } from "./type";

export type DashboardProps = {
  workspaceId?: string;
};

export const topTabItems: Omit<TabItems[], "active"> = [
  { id: "projects", text: "Projects", icon: "grid" },
  { id: "asset", text: "Assets", icon: "file" },
  { id: "members", text: "Members", icon: "users" },
  { id: "bin", text: "Recycle bin", icon: "trash" },
];

export const bottomTabsItems: Omit<TabItems[], "active"> = [
  { id: "plugin", text: "Plugin Playground", icon: "puzzlePiece", path: " " },
  { id: "documentary", text: "Documentary", icon: "book", path: " " },
  { id: "community", text: "Community", icon: "usersFour", path: " " },
  { id: "help", text: "Help & Support", icon: "question", path: " " },
];

const Dashboard: FC<DashboardProps> = ({ workspaceId }) => {
  const {
    isPersonal,
    currentWorkspace,
    topTabs,
    bottomTabs,
    workspaces,
    currentTab,
    onSignOut,
    handleWorkspaceChange,
  } = useHooks({ workspaceId, topTabItems, bottomTabsItems });

  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper>
      <LeftSideWrapper>
        <Header>
          <Typography size="body" weight="bold" color={theme.dangerous.strong}>
            {t("Re:Earth Visualizer")}
          </Typography>
        </Header>
        <LeftSidePanel
          tab={currentTab}
          isPersonal={isPersonal}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          topTabs={topTabs}
          bottomTabs={bottomTabs}
          onSignOut={onSignOut}
          onWorkspaceChange={handleWorkspaceChange}
        />
      </LeftSideWrapper>
      <ContentsContainer
        tab={currentTab}
        workspaceId={workspaceId}
        currentWorkspace={currentWorkspace}
      />
    </Wrapper>
  );
};

export default Dashboard;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  ["* ::-webkit-scrollbar"]: {
    width: "8px",
  },
  ["* ::-webkit-scrollbar-track"]: {
    background: theme.relative.darker,
    borderRadius: "10px",
  },
  ["* ::-webkit-scrollbar-thumb"]: {
    background: theme.relative.light,
    borderRadius: "4px",
  },
  ["* ::-webkit-scrollbar-thumb:hover"]: {
    background: theme.relative.lighter,
  },
  overflowX: "hidden",
  minWidth: "630px",
  ["@media (max-width: 630px)"]: {
    width: "630px",
    overflowX: "auto",
  },
}));

const LeftSideWrapper = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  width: "213px",
  gap: theme.spacing.super,
  boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.50)",
}));

const Header = styled("div")(({ theme }) => ({
  borderBottom: `1px solid ${theme.outline.weaker}`,
  alignContent: "center",
  padding: theme.spacing.normal,
}));
