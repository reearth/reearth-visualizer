import { ColorField, SelectField } from "@reearth/beta/ui/fields";
import { Position } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useCallback, useState } from "react";

import { SettingsFields, TitleWrapper } from "../common";

import { StorySettingsType } from ".";

type Props = {
  settingsItem: StorySettingsType;
  onUpdateStory: (settings: StorySettingsType) => void;
};

const StorySettingsDetail: React.FC<Props> = ({
  settingsItem,
  onUpdateStory
}) => {
  const t = useT();

  const [localPanelPosition, setLocalPanelPosition] = useState<
    Position | undefined
  >(settingsItem.panelPosition);
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>(
    settingsItem?.bgColor
  );
  const handleColorChange = useCallback(
    (bgColor?: string) => {
      onUpdateStory({
        bgColor
      });
      setBackgroundColor(bgColor);
    },
    [onUpdateStory]
  );

  const options = [
    {
      label: t("Left"),
      value: Position.Left
    },
    {
      label: t("Right"),
      value: Position.Right
    }
  ];

  const handlePositionChange = useCallback(
    (panelPosition?: Position) => {
      setLocalPanelPosition(panelPosition as Position);
      onUpdateStory({
        panelPosition
      });
    },
    [onUpdateStory]
  );

  return (
    <SettingsFields>
      <TitleWrapper size="body" weight="bold">
        {t("Story Panel settings")}
      </TitleWrapper>
      <SelectField
        title={t("Panel Position")}
        value={localPanelPosition}
        options={options}
        onChange={(value) => handlePositionChange(value as Position)}
      />
      <ColorField
        title={t("Background Color")}
        value={backgroundColor}
        onChange={(value) => handleColorChange(value)}
      />
    </SettingsFields>
  );
};

export default StorySettingsDetail;
