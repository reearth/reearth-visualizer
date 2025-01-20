import {
  SidebarMenuItem,
  SidebarMainSection,
  SidebarWrapper,
  SidebarButtonsWrapper
} from "@reearth/beta/ui/components/Sidebar";
import { Story } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";
import { useCallback, useMemo, useState } from "react";

import {
  InnerPage,
  SettingsWrapper,
  ArchivedSettingNotice,
  InnerSidebar
} from "../common";

import PublicSettingsDetail from "./PublicSettingsDetail";

export type PublicSettingsType = {
  publicTitle?: string;
  publicDescription?: string;
  publicImage?: string;
  publishmentStatus?: string;
};

export type PublicBasicAuthSettingsType = {
  isBasicAuthActive?: boolean;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
};

export type PublicAliasSettingsType = {
  alias: string;
};

export type PublicGASettingsType = {
  enableGa?: boolean;
  trackingId?: string;
};

export type SettingsProject = {
  id: string;
  publicTitle: string;
  publicDescription: string;
  publicImage: string;
  isBasicAuthActive: boolean;
  basicAuthUsername: string;
  basicAuthPassword: string;
  alias: string;
  publishmentStatus: string;
  isArchived: boolean;
  enableGa: boolean;
  trackingId: string;
  __typename?: string;
};

type Props = {
  project: SettingsProject;
  stories: Story[];
  currentStory?: Story;
  subId?: string;
  onUpdateStory: (settings: PublicSettingsType) => void;
  onUpdateStoryBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateStoryAlias: (settings: PublicAliasSettingsType) => void;
  onUpdateProject: (settings: PublicSettingsType) => void;
  onUpdateProjectBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateProjectAlias: (settings: PublicAliasSettingsType) => void;
  onUpdateProjectGA: (settings: PublicGASettingsType) => void;
};

const PublicSettings: React.FC<Props> = ({
  project,
  stories,
  currentStory,
  subId,
  onUpdateStory,
  onUpdateStoryBasicAuth,
  onUpdateStoryAlias,
  onUpdateProject,
  onUpdateProjectBasicAuth,
  onUpdateProjectAlias,
  onUpdateProjectGA
}) => {
  const t = useT();
  const [selectedTab, selectTab] = useState(subId ? subId : "map");

  const menu = useMemo(
    () => [
      {
        id: "map",
        title: t("Map"),
        icon: "globeSimple" as const,
        path: `/settings/projects/${project.id}/public/`,
        active: selectedTab === "map"
      },
      ...stories.map((s) => ({
        id: s.id,
        title: !s.title || s.title === "Default" ? t("Story") : s.title,
        icon: "sidebar" as const,
        path: `/settings/projects/${project.id}/public/${s.id}`,
        active: selectedTab === s.id
      }))
    ],
    [stories, selectedTab, project.id, t]
  );

  const handleTabChange = useCallback((tab: string) => selectTab(tab), []);

  return (
    <InnerPage wide>
      <InnerSidebar>
        <SidebarWrapper>
          <SidebarMainSection>
            <SidebarButtonsWrapper>
              {menu?.map((s) => (
                <SidebarMenuItem
                  key={s.id}
                  text={s.title}
                  icon={s.icon}
                  active={s.active}
                  path={s.path}
                  onClick={() => handleTabChange(s.id)}
                />
              ))}
            </SidebarButtonsWrapper>
          </SidebarMainSection>
        </SidebarWrapper>
      </InnerSidebar>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : selectedTab === currentStory?.id ? (
          <PublicSettingsDetail
            key={currentStory.id}
            settingsItem={currentStory}
            onUpdate={onUpdateStory}
            onUpdateBasicAuth={onUpdateStoryBasicAuth}
            onUpdateAlias={onUpdateStoryAlias}
          />
        ) : (
          <PublicSettingsDetail
            key="map"
            settingsItem={project}
            onUpdate={onUpdateProject}
            onUpdateBasicAuth={onUpdateProjectBasicAuth}
            onUpdateAlias={onUpdateProjectAlias}
            onUpdateGA={onUpdateProjectGA}
          />
        )}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default PublicSettings;
