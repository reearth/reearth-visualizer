import { styled } from "@reearth/services/theme";

import AddWorkspaceModal from "../CreateWorkspaceModal";

import useHook from "./hooks";
import LeftSection from "./LeftSection";
import useRightSide from "./useRightSection";

type Props = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
  isDashboard?: boolean;
  currentTab?: Tab;
  page?: "editor" | "settings" | "projectSettings";
};

export const Tabs = ["map", "story", "widgets", "publish"] as const;
export type Tab = (typeof Tabs)[number];

export const NAVBAR_HEIGHT = 52;

export function isTab(tab: string): tab is Tab {
  return Tabs.includes(tab as never);
}

const Navbar: React.FC<Props> = ({
  sceneId,
  projectId,
  workspaceId,
  currentTab = "map",
  page = "editor"
}) => {
  const {
    currentProject,
    currentWorkspace,
    workspaces,
    handleLogout,
    handleWorkspaceChange
  } = useHook({
    projectId,
    workspaceId
  });

  const { rightSide } = useRightSide({
    currentTab,
    sceneId,
    page
  });

  return (
    <>
      <Wrapper>
        <LeftSection
          currentProject={currentProject}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          sceneId={sceneId}
          page={page}
          onWorkspaceChange={handleWorkspaceChange}
          onSignOut={handleLogout}
        />
        {rightSide}
      </Wrapper>
      <AddWorkspaceModal />
    </>
  );
};

export default Navbar;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
  height: NAVBAR_HEIGHT,
  flexShrink: 0,
  gap: theme.spacing.super,
  background: theme.bg[0],
  zIndex: theme.zIndexes.editor.navbar,
  boxShadow: theme.shadow.card
}));
