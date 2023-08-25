import { useMemo } from "react";

import { Position, Story } from "@reearth/services/gql";

import { MenuItem } from "../../MenuList";
import { InnerPage, InnerMenu, SettingsWrapper, ArchivedSettingNotice } from "../common";

import StorySettingsDetail from "./StorySettingsDetail";

export type StorySettingsType = {
  panelPosition?: Position;
};

type Props = {
  projectId: string;
  stories: Story[];
  currentStory: Story;
  isArchived: boolean;
  onUpdateStory: (settings: StorySettingsType) => void;
};

const StorySettings: React.FC<Props> = ({
  projectId,
  stories,
  currentStory,
  isArchived,
  onUpdateStory,
}) => {
  const menu = useMemo(
    () =>
      stories.map(s => ({
        id: s.id,
        title: s.title,
        linkTo: `/beta/settings/projects/${projectId}/story/${s.id}`,
      })),
    [stories, projectId],
  );

  return (
    <InnerPage wide>
      <InnerMenu>
        {menu.map(s => (
          <MenuItem
            key={s.id}
            text={s.title}
            active={s.id === currentStory?.id}
            linkTo={s.linkTo}
          />
        ))}
      </InnerMenu>
      <SettingsWrapper>
        {isArchived ? (
          <ArchivedSettingNotice />
        ) : (
          <StorySettingsDetail
            key={currentStory.id}
            settingsItem={currentStory}
            onUpdateStory={onUpdateStory}
          />
        )}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default StorySettings;
