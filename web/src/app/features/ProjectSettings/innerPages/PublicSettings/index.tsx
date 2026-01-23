import type { Story } from "@reearth/services/api/storytelling";
import { FC, useMemo } from "react";

import { InnerPage, SettingsWrapper, ArchivedSettingNotice } from "../common";

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
  alias?: string;
};

export type PublicGASettingsType = {
  enableGa?: boolean;
  trackingId?: string;
};

export type PublicStorySettingsType = PublicSettingsType &
  PublicBasicAuthSettingsType &
  PublicAliasSettingsType &
  PublicGASettingsType;

export type SettingsProject = {
  id: string;
  publicTitle: string;
  publicDescription: string;
  publicImage: string;
  isBasicAuthActive: boolean;
  basicAuthUsername: string;
  basicAuthPassword: string;
  alias: string;
  scene?: {
    id: string;
    alias: string;
  } | null;
  publishmentStatus: string;
  isArchived: boolean;
  enableGa: boolean;
  trackingId: string;
};

type Props = {
  project: SettingsProject;
  sceneId?: string;
  isStory: boolean;
  currentStory?: Story;
  onUpdateStory: (settings: PublicStorySettingsType) => void;
  onUpdateStoryAlias: (settings: PublicStorySettingsType) => void;
  onUpdateProject: (settings: PublicSettingsType) => void;
  onUpdateProjectBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateProjectAlias: (settings: PublicAliasSettingsType) => void;
  onUpdateProjectGA: (settings: PublicGASettingsType) => void;
};

const PublicSettings: FC<Props> = ({
  project,
  sceneId,
  isStory,
  currentStory,
  onUpdateStory,
  onUpdateStoryAlias,
  onUpdateProject,
  onUpdateProjectBasicAuth,
  onUpdateProjectAlias,
  onUpdateProjectGA
}) => {
  const projectSettingsItem = useMemo(
    () => ({ ...project, type: "project" as const }),
    [project]
  );
  const storySettingsItem = useMemo(
    () =>
      currentStory ? { ...currentStory, type: "story" as const } : undefined,
    [currentStory]
  );

  return (
    <InnerPage wide>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : isStory && storySettingsItem ? (
          <PublicSettingsDetail
            key={currentStory?.id}
            isStory
            settingsItem={storySettingsItem}
            onUpdate={onUpdateStory}
            onUpdateBasicAuth={onUpdateStory}
            onUpdateAlias={onUpdateStoryAlias}
            onUpdateGA={onUpdateStory}
          />
        ) : project ? (
          <PublicSettingsDetail
            key="map"
            settingsItem={projectSettingsItem}
            sceneId={sceneId}
            onUpdate={onUpdateProject}
            onUpdateBasicAuth={onUpdateProjectBasicAuth}
            onUpdateAlias={onUpdateProjectAlias}
            onUpdateGA={onUpdateProjectGA}
          />
        ) : null}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default PublicSettings;
