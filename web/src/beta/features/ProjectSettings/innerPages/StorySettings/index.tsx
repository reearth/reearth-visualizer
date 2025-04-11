import { Position, Story } from "@reearth/services/api/storytellingApi/utils";

import { InnerPage, SettingsWrapper, ArchivedSettingNotice } from "../common";

import StorySettingsDetail from "./StorySettingsDetail";

export type StorySettingsType = {
  panelPosition?: Position;
  bgColor?: string;
};

type Props = {
  currentStory: Story;
  isArchived: boolean;
  onUpdateStory: (settings: StorySettingsType) => void;
};

const StorySettings: React.FC<Props> = ({
  currentStory,
  isArchived,
  onUpdateStory
}) => {
  return (
    <InnerPage wide>
      <SettingsWrapper>
        {isArchived ? (
          <ArchivedSettingNotice />
        ) : (
          <StorySettingsDetail
            key={currentStory.id}
            settingsItem={{
              panelPosition: currentStory.panelPosition,
              bgColor: currentStory.bgColor
            }}
            onUpdateStory={onUpdateStory}
          />
        )}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default StorySettings;
