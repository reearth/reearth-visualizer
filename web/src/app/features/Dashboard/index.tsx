import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { DEFAULT_SIDEBAR_WIDTH } from "@reearth/app/ui/components/Sidebar";
import { useMeFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import AddWorkspaceModal from "../CreateWorkspaceModal";
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
  const { useMeQuery } = useMeFetcher();
  const { me } = useMeQuery();
  const { lang } = me;

  const topTabItems: Omit<TabItems[], "active"> = useMemo(
    () => [
      { id: "projects", text: t("Projects"), icon: "grid" },
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
        path: "/plugin-playground"
      },
      {
        id: "documentation",
        text: t("Documentation"),
        icon: "book",
        path:
          lang === "ja"
            ? "https://eukarya.notion.site/Visualizer-1a816e0fb16580bda8b2c2699f80399c"
            : "https://eukarya.notion.site/Visualizer-User-manual-1a816e0fb16580e3a26ac6e35f23a166"
      },
      {
        id: "discord",
        text: t("Discord"),
        icon: "discord",
        path: "https://discord.com/invite/XJhYkQQDAu"
      },
      {
        id: "faq",
        text: t("FAQ"),
        icon: "question",
        path: "https://eukarya.notion.site/FAQ-19616e0fb16580f190aace7a918bfdd2"
      }
    ],
    [t, lang]
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
    <>
      <Wrapper data-testid="dashboard-wrapper">
        <LeftSideWrapper data-testid="dashboard-left-side-wrapper">
          <LeftSidePanel
            tab={currentTab}
            isPersonal={isPersonal}
            currentWorkspace={currentWorkspace}
            workspaces={workspaces}
            topTabs={topTabs}
            bottomTabs={bottomTabs}
            onSignOut={onSignOut}
            onWorkspaceChange={handleWorkspaceChange}
            data-testid="dashboard-left-side-panel"
          />
        </LeftSideWrapper>
        <ContentsContainer
          tab={currentTab}
          workspaceId={workspaceId}
          currentWorkspace={currentWorkspace}
          data-testid="dashboard-contents-container"
        />
        <CursorStatus data-testid="dashboard-cursor-status" />
      </Wrapper>
      <AddWorkspaceModal data-testid="dashboard-add-workspace-modal" />
    </>
  );
};

export default Dashboard;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  overflowX: "hidden",
  minWidth: "630px",
  ...theme.scrollBar,
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
