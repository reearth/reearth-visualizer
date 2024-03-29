import { useCallback, useMemo, useState } from "react";

import { Story } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";

import { MenuItem } from "../../MenuList";
import { InnerPage, InnerMenu, SettingsWrapper, ArchivedSettingNotice } from "../common";

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

type Props = {
  project: {
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
  };
  stories: Story[];
  currentStory?: Story;
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
  onUpdateStory,
  onUpdateStoryBasicAuth,
  onUpdateStoryAlias,
  onUpdateProject,
  onUpdateProjectBasicAuth,
  onUpdateProjectAlias,
  onUpdateProjectGA,
}) => {
  const t = useT();
  const [selectedTab, selectTab] = useState(currentStory ? currentStory.id : "map");

  const menu = useMemo(
    () => [
      {
        id: "map",
        title: t("Map"),
        linkTo: `/settings/project/${project.id}/public/`,
        active: selectedTab === "map",
      },
      ...stories.map(s => ({
        id: s.id,
        title: s.title,
        linkTo: `/settings/project/${project.id}/public/${s.id}`,
        active: selectedTab === s.id,
      })),
    ],
    [stories, selectedTab, project.id, t],
  );

  const handleTabChange = useCallback((tab: string) => selectTab(tab), []);

  return (
    <InnerPage wide>
      <InnerMenu>
        {menu.map(s => (
          <MenuItem
            key={s.id}
            text={s.title}
            active={s.active}
            linkTo={s.linkTo}
            onClick={() => handleTabChange(s.id)}
          />
        ))}
      </InnerMenu>
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
