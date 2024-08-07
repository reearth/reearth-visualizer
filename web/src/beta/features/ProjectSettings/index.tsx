import { useMemo } from "react";

import Navbar from "@reearth/beta/features/Navbar";
import {
  DEFAULT_SIDEBAR_WIDTH,
  SidebarMenuItem,
  SidebarSection,
  SidebarVersion,
  SidebarWrapper,
} from "@reearth/beta/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";
import GeneralSettings from "./innerPages/GeneralSettings";
import PluginSettings from "./innerPages/PluginSettings";
import PublicSettings from "./innerPages/PublicSettings";
import StorySettings from "./innerPages/StorySettings";

export const projectSettingTabs = [
  { id: "general", text: "General", icon: "setting" },
  { id: "story", text: "Story", icon: "sidebar" },
  { id: "public", text: "Public", icon: "paperPlaneTilt" },
  { id: "plugins", text: "Plugin", icon: "puzzlePiece" },
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
    handleDeleteProject,
    handleUpdateProjectBasicAuth,
    handleUpdateProjectAlias,
    handleUpdateProjectGA,
    handleUpdateStory,
    handleUpdateStoryBasicAuth,
    handleUpdateStoryAlias,
  } = useHooks({
    projectId,
    subId,
  });

  const tabs = useMemo(
    () =>
      projectSettingTabs.map(tab => ({
        id: tab.id,
        icon: tab.icon,
        text: t(tab.text),
        path: `/settings/project/${projectId}/${tab.id === "general" ? "" : tab.id}`,
      })),
    [projectId, t],
  );

  return (
    <Wrapper>
      <Navbar projectId={projectId} workspaceId={workspaceId} sceneId={sceneId} page="settings" />
      <MainSection>
        <LeftSidePanel>
          <SidebarWrapper>
            <SidebarSection>
              {tabs?.map(t => (
                <SidebarMenuItem
                  key={t.id}
                  path={t.path}
                  text={t.text}
                  active={t.id === tab}
                  icon={t.icon}
                />
              ))}
            </SidebarSection>
            <SidebarVersion />
          </SidebarWrapper>
        </LeftSidePanel>
        <Content>
          {tab === "general" && project && (
            <GeneralSettings
              project={project}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
          {tab === "story" && currentStory && (
            <StorySettings
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
              subId={subId}
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
        </Content>
      </MainSection>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  color: theme.content.main,
  backgroundColor: theme.bg[0],
  ["*"]: {
    boxSizing: "border-box",
  },
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
}));

const MainSection = styled("div")(() => ({
  display: "flex",
  flex: 1,
  overflow: "auto",
  position: "relative",
}));

const LeftSidePanel = styled("div")(({ theme }) => ({
  width: DEFAULT_SIDEBAR_WIDTH,
  height: "100%",
  backgroundColor: theme.bg[1],
  display: "flex",
  padding: `${theme.spacing.large}px 0`,
  boxSizing: "border-box",
}));

const Content = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  alignItems: "center",
  overflow: "auto",
  padding: `${theme.spacing.super}px`,
}));

export default ProjectSettings;
