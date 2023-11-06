import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import ColorField from "@reearth/beta/components/fields/ColorField";
import SelectField from "@reearth/beta/components/fields/SelectField";
import { Position } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

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
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>(settingsItem?.bgColor);
  const handleSubmit = useCallback(() => {
    onUpdateStory({
      panelPosition: localPanelPosition,
      bgColor: backgroundColor,
    });
  }, [backgroundColor, localPanelPosition, onUpdateStory]);

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
        <FieldsWrapper>
          <SelectFieldWrapper
            name={t("Panel Position")}
            value={localPanelPosition}
            options={options}
            onChange={value => setLocalPanelPosition(value as Position)}
          />
          <ColorFieldWrapper
            name={t("Background Color")}
            value={backgroundColor}
            onChange={value => setBackgroundColor(value)}
          />
        </FieldsWrapper>
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

const FieldsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  gap: 8px;
`;
const SelectFieldWrapper = styled(SelectField)`
  width: 100%;
`;
const ColorFieldWrapper = styled(ColorField)`
  width: 100%;
`;
