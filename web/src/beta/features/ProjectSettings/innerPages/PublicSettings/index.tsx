import { useMemo } from "react";

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
  };
  stories: Story[];
  currentStory?: Story;
  onUpdateStory: (settings: PublicSettingsType) => void;
  onUpdateStoryBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateStoryAlias: (settings: PublicAliasSettingsType) => void;
  onUpdateProject: (settings: PublicSettingsType) => void;
  onUpdateProjectBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateProjectAlias: (settings: PublicAliasSettingsType) => void;
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
}) => {
  const t = useT();

  const menu = useMemo(
    () => [
      {
        id: "map",
        title: t("Map"),
        linkTo: `/settings/project/${project.id}/public/`,
        active: !currentStory,
      },
      ...stories.map(s => ({
        id: s.id,
        title: s.title,
        linkTo: `/settings/project/${project.id}/public/${s.id}`,
        active: s.id === currentStory?.id,
      })),
    ],
    [stories, project.id, currentStory, t],
  );

  return (
    <InnerPage wide>
      <InnerMenu>
        {menu.map(s => (
          <MenuItem key={s.id} text={s.title} active={s.active} linkTo={s.linkTo} />
        ))}
      </InnerMenu>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : currentStory ? (
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
          />
        )}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default PublicSettings;
