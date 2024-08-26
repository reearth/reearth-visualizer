
import { Button, Collapse } from "@reearth/beta/lib/reearth-ui";
import { ColorField, SelectField } from "@reearth/beta/ui/fields";
import { Position } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useCallback, useState } from "react";

import {
  SettingsFields,
  ButtonWrapper,
  SettingsRow,
  SettingsRowItem,
} from "../common";

import { StorySettingsType } from ".";

type Props = {
  settingsItem: StorySettingsType;
  onUpdateStory: (settings: StorySettingsType) => void;
};

const StorySettingsDetail: React.FC<Props> = ({
  settingsItem,
  onUpdateStory,
}) => {
  const t = useT();

  const [localPanelPosition, setLocalPanelPosition] = useState<
    Position | undefined
  >(settingsItem.panelPosition);
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>(
    settingsItem?.bgColor,
  );
  const handleSubmit = useCallback(() => {
    onUpdateStory({
      panelPosition: localPanelPosition,
      bgColor: backgroundColor,
    });
  }, [backgroundColor, localPanelPosition, onUpdateStory]);

  const options = [
    {
      label: t("Left"),
      value: Position.Left,
    },
    {
      label: t("Right"),
      value: Position.Right,
    },
  ];

  return (
    <Collapse title={t("Story Panel")} size="large">
      <SettingsFields>
        <SettingsRow>
          <SettingsRowItem>
            <SelectField
              commonTitle={t("Panel Position")}
              value={localPanelPosition}
              options={options}
              onChange={(value) => setLocalPanelPosition(value as Position)}
            />
          </SettingsRowItem>
          <SettingsRowItem>
            <ColorField
              commonTitle={t("Background Color")}
              value={backgroundColor}
              onChange={(value) => setBackgroundColor(value)}
            />
          </SettingsRowItem>
        </SettingsRow>
        <ButtonWrapper>
          <Button
            title={t("Submit")}
            appearance="primary"
            onClick={handleSubmit}
          />
        </ButtonWrapper>
      </SettingsFields>
    </Collapse>
  );
};

export default StorySettingsDetail;
