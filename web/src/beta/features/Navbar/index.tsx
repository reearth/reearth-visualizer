import { styled } from "@reearth/services/theme";

import useHook from "./hooks";
import LeftSection from "./LeftSection";
import useRightSide from "./useRightSection";

type Props = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
  isDashboard?: boolean;
  currentTab?: Tab;
  page?: "editor" | "settings";
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
  isDashboard = false,
  page = "editor",
}) => {
  const {
    currentProject,
    workspace,
    isPersonal,
    username,
    workspaces,
    workspaceModalVisible,
    handleLogout,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
  } = useHook({ projectId, workspaceId });

  const { rightSide } = useRightSide({
    currentTab,
    sceneId,
    page,
  });

  return (
    <Wrapper>
      <LeftSection
        currentProject={currentProject}
        dashboard={isDashboard}
        currentWorkspace={workspace}
        username={username}
        personalWorkspace={isPersonal}
        modalShown={workspaceModalVisible}
        workspaces={workspaces}
        sceneId={sceneId}
        page={page}
        onWorkspaceChange={handleWorkspaceChange}
        onWorkspaceCreate={handleWorkspaceCreate}
        onSignOut={handleLogout}
        onModalClose={handleWorkspaceModalClose}
        openModal={handleWorkspaceModalOpen}
      />

      {rightSide}
    </Wrapper>
  );
};

export default Navbar;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: ${NAVBAR_HEIGHT}px;
  gap: 24px;
  background: ${({ theme }) => theme.bg[0]};
  z-index: ${({ theme }) => theme.zIndexes.editor.navbar};
`;
