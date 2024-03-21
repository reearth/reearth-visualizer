import { useMemo } from "react";

import Text from "@reearth/beta/components/Text";
import Navbar from "@reearth/beta/features/Navbar";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";
import AssetSettings from "./innerPages/AssetSettings";
import GeneralSettings from "./innerPages/GeneralSettings";
import PluginSettings from "./innerPages/PluginSettings";
import PublicSettings from "./innerPages/PublicSettings";
import StorySettings from "./innerPages/StorySettings";
import { MenuList, MenuItem } from "./MenuList";

export const projectSettingTabs = [
  { id: "general", text: "General" },
  { id: "story", text: "Story" },
  { id: "public", text: "Public" },
  { id: "asset", text: "Workspace Assets" },
  { id: "plugins", text: "Plugin" },
] as const;

export type projectSettingsTab = (typeof projectSettingTabs)[number]["id"];

export function isProjectSettingTab(tab: string): tab is projectSettingsTab {
  return projectSettingTabs.map(f => f.id).includes(tab as never);
}

type Props = {
  projectId: string;
  tab?: projectSettingsTab;
  subId?: string;
};

const ProjectSettings: React.FC<Props> = ({ projectId, tab, subId }) => {
  const t = useT();
  const {
    sceneId,
    workspaceId,
    project,
    plugins,
    stories,
    currentStory,
    accessToken,
    extensions,
    handleUpdateProject,
    handleArchiveProject,
    handleDeleteProject,
    handleUpdateProjectBasicAuth,
    handleUpdateProjectAlias,
    handleUpdateProjectGA,
    handleUpdateStory,
    handleUpdateStoryBasicAuth,
    handleUpdateStoryAlias,
  } = useHooks({
    projectId,
    tab,
    subId,
  });

  const tabs = useMemo(
    () =>
      projectSettingTabs.map(tab => ({
        id: tab.id,
        text: t(tab.text),
        linkTo: `/settings/project/${projectId}/${tab.id === "general" ? "" : tab.id}`,
      })),
    [projectId, t],
  );

  return (
    <Wrapper>
      <Navbar projectId={projectId} workspaceId={workspaceId} sceneId={sceneId} page="settings" />
      <SecondaryNav>
        <Title size="h5">{t("Project Settings")}</Title>
      </SecondaryNav>
      <MainSection>
        <Menu>
          <MenuList>
            {tabs.map(t => (
              <MenuItem key={t.id} linkTo={t.linkTo} text={t.text} active={t.id === tab} />
            ))}
          </MenuList>
        </Menu>
        <Content>
          {tab === "general" && project && (
            <GeneralSettings
              project={project}
              onUpdateProject={handleUpdateProject}
              onArchiveProject={handleArchiveProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
          {tab === "story" && currentStory && (
            <StorySettings
              projectId={projectId}
              stories={stories}
              currentStory={currentStory}
              isArchived={!!project?.isArchived}
              onUpdateStory={handleUpdateStory}
            />
          )}
          {tab === "public" && project && (
            <PublicSettings
              project={project}
              stories={stories}
              currentStory={currentStory}
              onUpdateStory={handleUpdateStory}
              onUpdateStoryBasicAuth={handleUpdateStoryBasicAuth}
              onUpdateStoryAlias={handleUpdateStoryAlias}
              onUpdateProject={handleUpdateProject}
              onUpdateProjectBasicAuth={handleUpdateProjectBasicAuth}
              onUpdateProjectAlias={handleUpdateProjectAlias}
              onUpdateProjectGA={handleUpdateProjectGA}
            />
          )}
          {tab === "plugins" && (
            <PluginSettings
              sceneId={sceneId}
              isArchived={!!project?.isArchived}
              accessToken={accessToken}
              plugins={plugins}
              extensions={extensions}
            />
          )}
          {tab === "asset" && workspaceId && <AssetSettings workspaceId={workspaceId} />}
        </Content>
      </MainSection>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.content.main};
  background-color: ${({ theme }) => theme.bg[0]};
`;

const SecondaryNav = styled.div`
  color: ${({ theme }) => theme.content.main};
  background-color: ${({ theme }) => theme.bg[1]};
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
`;

const Title = styled(Text)`
  padding: 12px;
`;

const MainSection = styled.div`
  flex: 1;
  overflow: auto;
`;

const Menu = styled.div`
  position: fixed;
  height: 100%;
  background-color: ${({ theme }) => theme.bg[1]};
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  margin-left: 200px;
  padding: 20px;
`;

export default ProjectSettings;
