import { useMemo } from "react";

// import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import { Position, Story } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

import { MenuListItemLabel } from "../MenuList";

import {
  InnerPage,
  InnerMenu,
  SettingsWrapper,
  SettingsFields,
  // ButtonWrapper,
  ArchivedSettingNotice,
} from "./common";

export type StorySettingsType = {
  panelPosition?: Position;
};

type Props = {
  projectId: string;
  stories: Story[];
  currentStory?: Story;
  isArchived?: boolean;
  onUpdateStory: (settings: StorySettingsType) => void;
};

const StorySettings: React.FC<Props> = ({ projectId, stories, currentStory, isArchived }) => {
  const t = useT();

  const menu = useMemo(
    () =>
      stories.map(s => ({
        id: s.id,
        title: s.title,
        linkTo: `/settings/beta/projects/${projectId}/story/${s.id}`,
      })),
    [stories, projectId],
  );

  return (
    <InnerPage wide>
      <InnerMenu>
        {menu.map(s => (
          <MenuListItemLabel
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
          <Collapse title={t("Story Panel")} type="settings" alwaysOpen>
            <SettingsFields>
              <div>Panel Position - Select Field</div>
              {/* <ButtonWrapper>
                <Button
                  text={t("Submit")}
                  size="medium"
                  margin="0"
                  buttonType="primary"
                  onClick={onUpdateStory}
                />
              </ButtonWrapper> */}
            </SettingsFields>
          </Collapse>
        )}
      </SettingsWrapper>
    </InnerPage>
  );
};

export default StorySettings;
