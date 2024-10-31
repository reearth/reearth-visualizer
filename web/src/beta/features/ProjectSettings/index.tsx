import Navbar from "@reearth/beta/features/Navbar";
import {
  DEFAULT_SIDEBAR_WIDTH,
  SidebarMenuItem,
  SidebarMainSection,
  SidebarVersion,
  SidebarWrapper,
  SidebarButtonsWrapper
} from "@reearth/beta/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useMemo } from "react";

import CursorStatus from "../CursorStatus";

import useHooks from "./hooks";
import GeneralSettings from "./innerPages/GeneralSettings";
import PluginSettings from "./innerPages/PluginSettings";
import PublicSettings from "./innerPages/PublicSettings";
import StorySettings from "./innerPages/StorySettings";

export type ProjectSettingsTab = "general" | "story" | "public" | "plugins";

type Props = {
  projectId: string;
  tab?: ProjectSettingsTab;
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
    disabled,
    handleUpdateProject,
    handleProjectRemove,
    handleUpdateProjectBasicAuth,
    handleUpdateProjectAlias,
    handleUpdateProjectGA,
    handleUpdateStory,
    handleUpdateStoryBasicAuth,
    handleUpdateStoryAlias
  } = useHooks({
    projectId,
    subId
  });

  const tabs = useMemo(
    () => [
      {
        id: "general",
        text: t("General"),
        icon: "setting" as const,
        path: `/settings/projects/${projectId}/`
      },
      {
        id: "story",
        text: t("Story"),
        icon: "sidebar" as const,
        path: `/settings/projects/${projectId}/story`
      },
      {
        id: "public",
        text: t("Public"),
        icon: "paperPlaneTilt" as const,
        path: `/settings/projects/${projectId}/public`
      },
      {
        id: "plugins",
        text: t("Plugin"),
        icon: "puzzlePiece" as const,
        path: `/settings/projects/${projectId}/plugins`
      }
    ],
    [projectId, t]
  );

  return (
    <Wrapper>
      <Navbar
        projectId={projectId}
        workspaceId={workspaceId}
        sceneId={sceneId}
        page="projectSettings"
      />
      <MainSection>
        <LeftSidePanel>
          <SidebarWrapper>
            <SidebarMainSection>
              <SidebarButtonsWrapper>
                {tabs?.map((t) => (
                  <SidebarMenuItem
                    key={t.id}
                    path={t.path}
                    text={t.text}
                    active={t.id === tab}
                    icon={t.icon}
                  />
                ))}
              </SidebarButtonsWrapper>
            </SidebarMainSection>
            <SidebarVersion />
          </SidebarWrapper>
        </LeftSidePanel>
        <Content>
          {tab === "general" && project && (
            <GeneralSettings
              project={project}
              onUpdateProject={handleUpdateProject}
              onProjectRemove={handleProjectRemove}
              disabled={disabled}
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
      <CursorStatus />
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
    boxSizing: "border-box"
  },
  ...theme.scrollBar
}));

const MainSection = styled("div")(() => ({
  display: "flex",
  flex: 1,
  overflow: "auto",
  position: "relative"
}));

const LeftSidePanel = styled("div")(({ theme }) => ({
  width: DEFAULT_SIDEBAR_WIDTH,
  height: "100%",
  backgroundColor: theme.bg[1],
  display: "flex",
  padding: `${theme.spacing.large}px 0`,
  boxSizing: "border-box"
}));

const Content = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  alignItems: "center",
  overflow: "auto",
  padding: `${theme.spacing.super}px`
}));

export default ProjectSettings;
