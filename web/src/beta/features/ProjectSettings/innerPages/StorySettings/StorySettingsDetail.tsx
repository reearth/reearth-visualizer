import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import { useT } from "@reearth/services/i18n";

import { SettingsFields, ButtonWrapper } from "../common";

import { StorySettingsType } from ".";

type Props = {
  settingsItem: StorySettingsType;
  onUpdateStory: (settings: StorySettingsType) => void;
};

const StorySettingsDetail: React.FC<Props> = ({ settingsItem, onUpdateStory }) => {
  const t = useT();

  // TODO: select filed
  const [localPanelPosition] = useState(settingsItem.panelPosition);
  const handleSubmit = useCallback(() => {
    onUpdateStory({
      panelPosition: localPanelPosition,
    });
  }, [localPanelPosition, onUpdateStory]);

  return (
    <Collapse title={t("Story Panel")} alwaysOpen>
      <SettingsFields>
        <div>Panel Position - Select Field {settingsItem.panelPosition}</div>
        <ButtonWrapper>
          <Button
            text={t("Submit")}
            size="medium"
            margin="0"
            buttonType="primary"
            onClick={handleSubmit}
          />
        </ButtonWrapper>
      </SettingsFields>
    </Collapse>
  );
};

export default StorySettingsDetail;
