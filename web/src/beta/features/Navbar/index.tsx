import { styled } from "@reearth/services/theme";

import useHook from "./hooks";
import LeftSection from "./LeftSection";
import useRightSide from "./useRightSection";

type Props = {
  sceneId: string;
  isDashboard?: boolean;
  currentTab: Tab;
};

export const Tabs = ["scene", "story", "widgets", "publish"] as const;
export type Tab = (typeof Tabs)[number];

export function isTab(tab: string): tab is Tab {
  return Tabs.includes(tab as never);
}

const Navbar: React.FC<Props> = ({ sceneId, currentTab = "scene", isDashboard = false }) => {
  const {
    currentProject,
    currentWorkspace,
    isPersonal,
    user,
    workspaces,
    workspaceModalVisible,
    handleLogout,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
  } = useHook(sceneId);

  const { rightSide } = useRightSide({
    currentTab,
    sceneId,
    page: "editor",
  });

  return (
    <Wrapper>
      <LeftSection
        currentProject={currentProject}
        dashboard={isDashboard}
        currentWorkspace={currentWorkspace}
        user={user}
        personalWorkspace={isPersonal}
        modalShown={workspaceModalVisible}
        workspaces={workspaces}
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
  padding: 8px 24px;
  gap: 24px;
  width: 100%;
  height: 51px;
  background: ${({ theme }) => theme.editorNavBar.bg};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
`;
