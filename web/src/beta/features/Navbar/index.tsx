import TabButton from "@reearth/beta/features/Navbar/TabButton";
import { useEditorNavigation } from "@reearth/beta/hooks";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHook from "./hooks";
import LeftSection from "./LeftSection";

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

  const handleEditorNavigation = useEditorNavigation({ sceneId });
  const t = useT();
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

      <RightSection>
        <TabButton
          onClick={() => handleEditorNavigation("scene")}
          selected={currentTab === "scene"}
          label={t("Scene")}
        />

        <TabButton
          onClick={() => handleEditorNavigation("story")}
          selected={currentTab === "story"}
          label={t("Story")}
        />

        <TabButton
          onClick={() => handleEditorNavigation("widgets")}
          selected={currentTab === "widgets"}
          label={t("Widgets")}
        />

        <TabButton
          onClick={() => handleEditorNavigation("publish")}
          selected={currentTab === "publish"}
          label={t("Publish")}
        />
      </RightSection>
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
const RightSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;   
  padding-right:24px
  gap: 4px;
  width: 301px;
  height: 35px;
`;
