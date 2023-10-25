import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import SelectField from "@reearth/beta/components/fields/SelectField";
import { Position } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

import { SettingsFields, ButtonWrapper } from "../common";

import { StorySettingsType } from ".";

type Props = {
  settingsItem: StorySettingsType;
  onUpdateStory: (settings: StorySettingsType) => void;
};

const StorySettingsDetail: React.FC<Props> = ({ settingsItem, onUpdateStory }) => {
  const t = useT();

  const [localPanelPosition, setLocalPanelPosition] = useState<Position | undefined>(
    settingsItem.panelPosition,
  );

  const handleSubmit = useCallback(() => {
    onUpdateStory({
      panelPosition: localPanelPosition,
    });
  }, [localPanelPosition, onUpdateStory]);

  const options = [
    {
      label: t("Left"),
      key: Position.Left,
    },
    {
      label: t("Right"),
      key: Position.Right,
    },
  ];

  return (
    <Collapse title={t("Story Panel")} alwaysOpen>
      <SettingsFields>
        <SelectField
          name={t("Panel Position")}
          value={localPanelPosition}
          options={options}
          onChange={value => setLocalPanelPosition(value as Position)}
        />
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
