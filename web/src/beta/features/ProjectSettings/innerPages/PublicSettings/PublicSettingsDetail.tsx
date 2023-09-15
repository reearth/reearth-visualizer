import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import TextInput from "@reearth/beta/components/fields/TextField";
import { useT } from "@reearth/services/i18n";

import { SettingsFields, ButtonWrapper } from "../common";

import { PublicAliasSettingsType, PublicBasicAuthSettingsType, PublicSettingsType } from ".";

type Props = {
  settingsItem: PublicSettingsType & PublicBasicAuthSettingsType & PublicAliasSettingsType;
  onUpdate: (settings: PublicSettingsType) => void;
  onUpdateBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateAlias: (settings: PublicAliasSettingsType) => void;
};

const PublicSettingsDetail: React.FC<Props> = ({
  settingsItem,
  onUpdate,
  onUpdateBasicAuth,
  onUpdateAlias,
}) => {
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

  const [localBasicAuthorization, setBasicAuthorization] = useState({
    isBasicAuthActive: !!settingsItem.isBasicAuthActive,
    basicAuthUsername: settingsItem.basicAuthUsername,
    basicAuthPassword: settingsItem.basicAuthPassword,
  });
  const handleSubmitBasicAuthorization = useCallback(() => {
    onUpdateBasicAuth({
      ...localBasicAuthorization,
    });
  }, [localBasicAuthorization, onUpdateBasicAuth]);

  const [localAlias, setLocalAlias] = useState(settingsItem.alias);
  const handleSubmitAlias = useCallback(() => {
    onUpdateAlias({
      alias: localAlias,
    });
  }, [localAlias, onUpdateAlias]);

  return (
    <>
      <Collapse title={t("Public Info")}>
        <SettingsFields>
          <TextInput
            name={t("Title")}
            value={settingsItem.publicTitle}
            onChange={(publicTitle: string) => {
              setLocalPublicInfo(s => ({ ...s, publicTitle }));
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
      <Collapse title={t("Basic Authorization")}>
        <SettingsFields>
          <div>Enable basic authorization - Boolean Field</div>
          {/* TODO: basicAuthUsername & basicAuthPassword can be updated only when isBasicAuthActive is true*/}
          <TextInput
            name={t("Username")}
            value={settingsItem.basicAuthUsername}
            onChange={(basicAuthUsername: string) => {
              setBasicAuthorization(s => ({ ...s, basicAuthUsername }));
            }}
            timeout={0}
          />
          <TextInput
            name={t("Password")}
            value={settingsItem.basicAuthPassword}
            onChange={(basicAuthPassword: string) => {
              setBasicAuthorization(s => ({ ...s, basicAuthPassword }));
            }}
            timeout={0}
          />
          <ButtonWrapper>
            <Button
              text={t("Submit")}
              size="medium"
              margin="0"
              buttonType="primary"
              onClick={handleSubmitBasicAuthorization}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Site Setting")}>
        <SettingsFields>
          <TextInput
            name={t("Site name")}
            value={settingsItem.alias}
            onChange={(alias: string) => {
              setLocalAlias(alias);
            }}
            timeout={0}
            description={t(
              "You are about to change the site name for your project. Only alphanumeric characters and hyphens are allows.",
            )}
          />
          <ButtonWrapper>
            <Button
              text={t("Submit")}
              size="medium"
              margin="0"
              buttonType="primary"
              onClick={handleSubmitAlias}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
    </>
  );
};

export default PublicSettingsDetail;
