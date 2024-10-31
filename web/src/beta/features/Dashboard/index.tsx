import { DEFAULT_SIDEBAR_WIDTH } from "@reearth/beta/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import CursorStatus from "../CursorStatus";

import ContentsContainer from "./ContentsContainer";
import useHooks from "./hooks";
import LeftSidePanel from "./LeftSidePanel";
import { TabItems } from "./type";

export type DashboardProps = {
  workspaceId?: string;
};

const Dashboard: FC<DashboardProps> = ({ workspaceId }) => {
  const t = useT();
  const topTabItems: Omit<TabItems[], "active"> = useMemo(
    () => [
      { id: "projects", text: t("Projects"), icon: "grid" },
      { id: "asset", text: t("Assets"), icon: "file" },
      { id: "members", text: t("Members"), icon: "users" },
      { id: "bin", text: t("Recycle bin"), icon: "trash" }
    ],
    [t]
  );

  const bottomTabsItems: Omit<TabItems[], "active"> = useMemo(
    () => [
      {
        id: "plugin",
        text: t("Plugin Playground"),
        icon: "puzzlePiece",
        disabled: true
      },
      {
        id: "documentation",
        text: t("Documentation"),
        icon: "book",
        disabled: true
      },
      {
        id: "community",
        text: t("Community"),
        icon: "usersFour",
        disabled: true
      },
      {
        id: "help",
        text: t("Help & Support"),
        icon: "question",
        disabled: true
      }
    ],
    [t]
  );

  const {
    isPersonal,
    currentWorkspace,
    topTabs,
    bottomTabs,
    workspaces,
    currentTab,
    onSignOut,
    handleWorkspaceChange
  } = useHooks({ workspaceId, topTabItems, bottomTabsItems });

  return (
    <Wrapper>
      <LeftSideWrapper>
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
      <CursorStatus />
    </Wrapper>
  );
};

export default Dashboard;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  ["* ::-webkit-scrollbar"]: {
    width: "8px"
  },
  ["* ::-webkit-scrollbar-track"]: {
    background: theme.relative.darker,
    borderRadius: "10px"
  },
  ["* ::-webkit-scrollbar-thumb"]: {
    background: theme.relative.light,
    borderRadius: "4px"
  },
  ["* ::-webkit-scrollbar-thumb:hover"]: {
    background: theme.relative.lighter
  },
  overflowX: "hidden",
  minWidth: "630px",
  ["@media (max-width: 630px)"]: {
    width: "630px",
    overflowX: "auto"
  }
}));

const LeftSideWrapper = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  width: DEFAULT_SIDEBAR_WIDTH,
  gap: theme.spacing.super,
  boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.50)"
}));
