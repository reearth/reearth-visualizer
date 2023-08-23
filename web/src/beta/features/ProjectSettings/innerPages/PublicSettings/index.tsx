import { useMemo } from "react";

import { StoryFragmentFragment } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

import { MenuListItemLabel } from "../../MenuList";
import { InnerPage, InnerMenu, SettingsWrapper, ArchivedSettingNotice } from "../common";

import PublicSettingsDetail from "./PublicSettingsDetail";

type Props = {
  project: {
    id: string;
    isArchived: boolean;
    publicTitle: string;
    publicDescription: string;
    publicImage: string;
    isBasicAuthActive: boolean;
    basicAuthUsername: string;
    basicAuthPassword: string;
    alias: string;
    publishmentStatus: string;
  };
  stories: StoryFragmentFragment[];
  currentStory?: StoryFragmentFragment;
  onUpdateStory: () => void;
};

const PublicSettings: React.FC<Props> = ({ project, stories, currentStory }) => {
  const t = useT();

  const menu = useMemo(
    () => [
      {
        id: "map",
        title: t("Map"),
        linkTo: `/settings/beta/projects/${project.id}/public/`,
        active: !currentStory,
      },
      ...(stories.length > 0
        ? stories
        : // TODO: Check default story
          [
            {
              id: "defaultStory",
              title: "Story",
            },
          ]
      ).map(s => ({
        id: s.id,
        title: s.title,
        linkTo: `/settings/beta/projects/${project.id}/public/${s.id}`,
        active: s.id === currentStory?.id,
      })),
    ],
    [stories, project.id, currentStory, t],
  );

  const story = useMemo(
    () =>
      currentStory
        ? {
            id: currentStory.id,
            publicTitle: currentStory?.id,
            publicDescription: currentStory?.id,
            publicImage: currentStory?.id,
            isBasicAuthActive: true,
            basicAuthUsername: currentStory?.id,
            basicAuthPassword: currentStory?.id,
            alias: currentStory?.id,
            publishmentStatus: currentStory?.id,
          }
        : undefined,
    [currentStory],
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
        ) : story ? (
          <PublicSettingsDetail settingsItem={story} />
        ) : (
          <PublicSettingsDetail settingsItem={project} />
        )}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default PublicSettings;
