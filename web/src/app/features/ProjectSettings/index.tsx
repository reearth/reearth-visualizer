import Navbar from "@reearth/app/features/Navbar";
import {
  DEFAULT_SIDEBAR_WIDTH,
  SidebarMenuItem,
  SidebarMainSection,
  SidebarVersion,
  SidebarWrapper,
  SidebarButtonsWrapper
} from "@reearth/app/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import CursorStatus from "../CursorStatus";

import useHooks from "./hooks";
import Assets from "./innerPages/AssetSetting";
import GeneralSettings from "./innerPages/GeneralSettings";
import LicenseSettings from "./innerPages/LicenseSettings";
import PluginSettings from "./innerPages/PluginSettings";
import PublicSettings from "./innerPages/PublicSettings";
import ReadMeSettings from "./innerPages/ReadMeSettings";
import StorySettings from "./innerPages/StorySettings";

export const projectSettingsTabs = [
  "general",
  "story",
  "public",
  "plugins",
  "assets",
  "readme",
  "license"
] as const;

export type ProjectSettingsTab = (typeof projectSettingsTabs)[number];

export type ProjectSettingsProps = {
  projectId: string;
  tab?: ProjectSettingsTab;
  subId?: string;
};

const ProjectSettings: FC<ProjectSettingsProps> = ({
  projectId,
  tab,
  subId
}) => {
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
    handleUpdateStoryAlias,
    handleUpdateProjectMetadata
  } = useHooks({
    projectId,
    subId,
    tab
  });

  const tabs = useMemo(
    () => [
      {
        id: "general",
        text: t("General"),
        icon: "setting" as const,
        path: `/settings/projects/${projectId}/`,
        active: tab === "general"
      },
      {
        id: "readme",
        text: t("README"),
        icon: "clipBoard" as const,
        path: `/settings/projects/${projectId}/readme`,
        active: tab === "readme"
      },
      {
        id: "license",
        text: t("License"),
        icon: "copyright" as const,
        path: `/settings/projects/${projectId}/license`,
        active: tab === "license"
      },
      {
        id: "story",
        text: t("Story"),
        icon: "sidebar" as const,
        path: `/settings/projects/${projectId}/story`,
        active: tab === "story"
      },
      {
        id: "public",
        text: t("Public"),
        icon: "paperPlaneTilt" as const,
        path: `/settings/projects/${projectId}/public`,
        subItem: [
          {
            id: "scene",
            text: t("Scene"),
            path: `/settings/projects/${projectId}/public`,
            active: tab === "public" && !subId
          },
          ...stories.map((s) => ({
            id: s.id,
            text: `${t("Story")} ${s.title}`,
            path: `/settings/projects/${projectId}/public/${s.id}`,
            active: tab === "public" && subId === s.id
          }))
        ]
      },
      {
        id: "assets",
        text: t("Assets"),
        icon: "file" as const,
        path: `/settings/projects/${projectId}/assets`,
        active: tab === "assets"
      },
      {
        id: "plugins",
        text: t("Plugin"),
        icon: "puzzlePiece" as const,
        path: `/settings/projects/${projectId}/plugins`,
        active: tab === "plugins"
      }
    ],
    [projectId, stories, tab, subId, t]
  );

  return (
    <Wrapper data-testid="project-settings-wrapper">
      <Navbar
        data-testid="project-settings-navbar"
        projectId={projectId}
        workspaceId={workspaceId}
        sceneId={sceneId}
        page="projectSettings"
      />
      <MainSection data-testid="project-settings-main-section">
        <LeftSidePanel data-testid="project-settings-sidebar">
          <SidebarWrapper>
            <SidebarMainSection>
              <SidebarButtonsWrapper>
                {tabs?.map((t) => (
                  <SidebarMenuItem
                    key={t.id}
                    path={t.path}
                    text={t.text}
                    active={t.active}
                    icon={t.icon}
                    subItem={t.subItem}
                    openSubItem={true}
                    data-testid={`project-settings-tab-${t.id}`}
                  />
                ))}
              </SidebarButtonsWrapper>
            </SidebarMainSection>
            <SidebarVersion data-testid="project-settings-sidebar-version" />
          </SidebarWrapper>
        </LeftSidePanel>
        <Content
          data-testid={`project-settings-content-${tab ?? "none"}`}
          tab={tab}
        >
          {tab === "general" && project && (
            <GeneralSettings
              data-testid="project-settings-general"
              project={project}
              workspaceId={workspaceId || ""}
              onUpdateProject={handleUpdateProject}
              onProjectRemove={handleProjectRemove}
              disabled={disabled}
            />
          )}
          {tab === "readme" && project && (
            <ReadMeSettings
              data-testid="project-settings-readme"
              projectMetadata={project.metadata}
              onUpdateProjectMetadata={handleUpdateProjectMetadata}
            />
          )}
          {tab === "license" && project && (
            <LicenseSettings
              data-testid="project-settings-license"
              projectMetadata={project.metadata}
              onUpdateProjectMetadata={handleUpdateProjectMetadata}
            />
          )}
          {tab === "story" && currentStory && (
            <StorySettings
              data-testid="project-settings-story"
              currentStory={currentStory}
              isArchived={!!project?.isArchived}
              onUpdateStory={handleUpdateStory}
            />
          )}
          {tab === "public" && project && (
            <PublicSettings
              data-testid="project-settings-public"
              project={project}
              sceneId={sceneId}
              isStory={!!subId}
              currentStory={currentStory}
              onUpdateStoryAlias={handleUpdateStoryAlias}
              onUpdateStory={handleUpdateStory}
              onUpdateProject={handleUpdateProject}
              onUpdateProjectBasicAuth={handleUpdateProjectBasicAuth}
              onUpdateProjectAlias={handleUpdateProjectAlias}
              onUpdateProjectGA={handleUpdateProjectGA}
            />
          )}
          {tab === "assets" && project && (
            <Assets
              data-testid="project-settings-assets"
              projectId={projectId}
              workspaceId={workspaceId}
            />
          )}

          {tab === "plugins" && (
            <PluginSettings
              data-testid="project-settings-plugins"
              sceneId={sceneId}
              isArchived={!!project?.isArchived}
              accessToken={accessToken}
              plugins={plugins}
              extensions={extensions}
            />
          )}
        </Content>
      </MainSection>
      <CursorStatus data-testid="project-settings-cursor-status" />
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

const Content = styled("div")<{ tab?: ProjectSettingsTab }>(
  ({ tab, theme }) => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    alignItems: "center",
    overflow: "auto",
    padding: tab === "assets" ? 0 : `${theme.spacing.super}px`
  })
);

export default ProjectSettings;
