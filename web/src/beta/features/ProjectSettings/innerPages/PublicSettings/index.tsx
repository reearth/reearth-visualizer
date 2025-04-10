import { Story } from "@reearth/services/api/storytellingApi/utils";
import { FC } from "react";

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
  publishmentStatus: string;
  isArchived: boolean;
  enableGa: boolean;
  trackingId: string;
};

type Props = {
  project: SettingsProject;
  currentStory?: Story;
  selectedTab?: string;
  onUpdateStory: (settings: PublicStorySettingsType) => void;
  onUpdateProject: (settings: PublicSettingsType) => void;
  onUpdateProjectBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateProjectAlias: (settings: PublicAliasSettingsType) => void;
  onUpdateProjectGA: (settings: PublicGASettingsType) => void;
};

const PublicSettings: FC<Props> = ({
  project,
  currentStory,
  selectedTab,
  onUpdateStory,
  onUpdateProject,
  onUpdateProjectBasicAuth,
  onUpdateProjectAlias,
  onUpdateProjectGA
}) => {

  return (
    <InnerPage wide>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : selectedTab === currentStory?.id ? (
          <PublicSettingsDetail
            key={currentStory?.id}
            isStory={selectedTab === currentStory?.id}
            settingsItem={currentStory as Story}
            onUpdate={onUpdateStory}
            onUpdateBasicAuth={onUpdateStory}
            onUpdateAlias={onUpdateStory}
            onUpdateGA={onUpdateStory}
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
