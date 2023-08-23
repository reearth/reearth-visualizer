import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import TextInput from "@reearth/beta/components/properties/TextInput";
import { useT } from "@reearth/services/i18n";

import { SettingsFields, ButtonWrapper } from "../common";

import { PublicSettingsType } from ".";

type Props = {
  settingsItem: PublicSettingsType;
  onUpdate: (settings: PublicSettingsType) => void;
};

const PublicSettingsDetail: React.FC<Props> = ({ settingsItem, onUpdate }) => {
  const t = useT();

  const [localPublicInfo, setLocalPublicInfo] = useState({
    publicTitle: settingsItem.publicTitle,
    publicDescription: settingsItem.publicDescription,
    publicImage: settingsItem.publicImage,
  });
  const handleSubmitPublicInfo = useCallback(() => {
    onUpdate({
      ...localPublicInfo,
    });
  }, [localPublicInfo, onUpdate]);

  return (
    <>
      <Collapse title={t("Public Info")} type="settings">
        <SettingsFields>
          <TextInput
            name={t("Title")}
            value={settingsItem.publicTitle}
            onChange={publicTitle => {
              setLocalPublicInfo(s => ({ ...s, publicTitle: publicTitle }));
            }}
            timeout={0}
          />
          <div>Description - TextArea Field</div>
          <div>Thumbnail - Image Upload Field</div>
          <ButtonWrapper>
            <Button
              text={t("Submit")}
              size="medium"
              margin="0"
              buttonType="primary"
              onClick={handleSubmitPublicInfo}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Basic Authorization")} type="settings">
        <SettingsFields>
          <div>Enable basic authorization - Boolean Field</div>
          <TextInput
            name={t("Username")}
            value={settingsItem.basicAuthUsername}
            onChange={() => {}}
            timeout={0}
          />
          <TextInput
            name={t("Password")}
            value={settingsItem.basicAuthPassword}
            onChange={() => {}}
            timeout={0}
          />
          <ButtonWrapper>
            <Button
              text={t("Submit")}
              size="medium"
              margin="0"
              buttonType="primary"
              onClick={() => {}}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Site Setting")} type="settings">
        <SettingsFields>
          <TextInput
            name={t("Site name")}
            value={settingsItem.alias}
            onChange={() => {}}
            timeout={0}
          />
        </SettingsFields>
      </Collapse>
    </>
  );
};

export default PublicSettingsDetail;
