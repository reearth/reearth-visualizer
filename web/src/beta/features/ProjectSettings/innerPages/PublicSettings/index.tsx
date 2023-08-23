import { useMemo } from "react";

import { Story } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

import { MenuListItemLabel } from "../../MenuList";
import { InnerPage, InnerMenu, SettingsWrapper, ArchivedSettingNotice } from "../common";

import PublicSettingsDetail from "./PublicSettingsDetail";

export type PublicSettingsType = {
  publicTitle?: string;
  publicDescription?: string;
  publicImage?: string;
  isBasicAuthActive?: boolean;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
  alias?: string;
  publishmentStatus?: string;
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
  onUpdateProject: (settings: PublicSettingsType) => void;
};

const PublicSettings: React.FC<Props> = ({
  project,
  stories,
  currentStory,
  onUpdateStory,
  onUpdateProject,
}) => {
  const t = useT();

  const menu = useMemo(
    () => [
      {
        id: "map",
        title: t("Map"),
        linkTo: `/settings/beta/projects/${project.id}/public/`,
        active: !currentStory,
      },
      ...stories.map(s => ({
        id: s.id,
        title: s.title,
        linkTo: `/settings/beta/projects/${project.id}/public/${s.id}`,
        active: s.id === currentStory?.id,
      })),
    ],
    [stories, project.id, currentStory, t],
  );

  return (
    <InnerPage hasMenu>
      <InnerMenu>
        {menu.map(s => (
          <MenuListItemLabel key={s.id} text={s.title} active={s.active} linkTo={s.linkTo} />
        ))}
      </InnerMenu>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : currentStory ? (
          <PublicSettingsDetail settingsItem={currentStory} onUpdate={onUpdateStory} />
        ) : (
          <PublicSettingsDetail settingsItem={project} onUpdate={onUpdateProject} />
        )}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default PublicSettings;
