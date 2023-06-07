import { useEditorNavigation } from "@reearth/beta/hooks";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import CommonHeader from "./CommonHeader";
import useHook from "./hooks";

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
      <CommonHeader
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

      <RightHeader>
        <TabButton
          onClick={() => handleEditorNavigation("scene")}
          isSelected={currentTab === "scene"}>
          {t("Scene")}
        </TabButton>
        <TabButton
          onClick={() => handleEditorNavigation("story")}
          isSelected={currentTab === "story"}>
          {t("Story")}
        </TabButton>
        <TabButton
          onClick={() => handleEditorNavigation("widgets")}
          isSelected={currentTab === "widgets"}>
          {t("Widgets")}
        </TabButton>
        <TabButton
          onClick={() => handleEditorNavigation("publish")}
          isSelected={currentTab === "publish"}>
          {t("Publish")}
        </TabButton>
      </RightHeader>
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
  width: 1920px;
  height: 51px;
  background: ${({ theme }) => theme.editorNavBar.bg};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
`;
const RightHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;   
  padding-right:24px
  gap: 4px;
  width: 301px;
  height: 35px;
`;

const TabButton = styled.button<{ isSelected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  padding: 8px 12px;
  gap: 10px;
  width: 67px;
  height: 35px;
  border-radius: 4px;
  color: ${({ isSelected, theme }) => (isSelected ? theme.main.text : theme.main.weak)};
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.main.lighterBg : theme.editorNavBar.bg};
  font-weight: 700;
  font-size: 14px;
  line-height: 19px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
