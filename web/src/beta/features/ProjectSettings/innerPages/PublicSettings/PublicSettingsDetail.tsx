import { useCallback, useState } from "react";

import defaultBetaProjectImage from "@reearth/beta/components/Icon/Icons/defaultBetaProjectImage.png";
import { IMAGE_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import { Button, Collapse } from "@reearth/beta/lib/reearth-ui";
import { AssetField, InputField, SwitchField } from "@reearth/beta/ui/fields";
import TextAreaField from "@reearth/beta/ui/fields/TextareaField";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useGA } from "../../../Published/googleAnalytics/useGA";
import { SettingsFields, ButtonWrapper } from "../common";

import {
  PublicAliasSettingsType,
  PublicBasicAuthSettingsType,
  PublicSettingsType,
  PublicGASettingsType,
} from ".";

type Props = {
  settingsItem: PublicSettingsType &
    PublicBasicAuthSettingsType &
    PublicAliasSettingsType &
    PublicGASettingsType;
  onUpdate: (settings: PublicSettingsType) => void;
  onUpdateBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateAlias: (settings: PublicAliasSettingsType) => void;
  onUpdateGA?: (settings: PublicGASettingsType) => void;
};

const PublicSettingsDetail: React.FC<Props> = ({
  settingsItem,
  onUpdate,
  onUpdateBasicAuth,
  onUpdateAlias,
  onUpdateGA,
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

  const [localGA, setLocalGA] = useState<PublicGASettingsType>({
    enableGa: settingsItem.enableGa,
    trackingId: settingsItem.trackingId,
  });

  const handleSubmitGA = useCallback(() => {
    if (onUpdateGA) {
      onUpdateGA({
        enableGa: localGA.enableGa,
        trackingId: localGA.trackingId,
      });
    }
  }, [localGA, onUpdateGA]);

  useGA(localGA);

  return (
    <>
      <Collapse title={t("Public Info")} size="large">
        <SettingsFields>
          <InputField
            commonTitle={t("Title")}
            value={settingsItem.publicTitle}
            onChange={(publicTitle: string) => {
              setLocalPublicInfo(s => ({ ...s, publicTitle }));
            }}
          />
          <TextAreaField
            commonTitle={t("Description")}
            value={localPublicInfo.publicDescription ?? ""}
            onChange={(publicDescription: string) => {
              setLocalPublicInfo(s => ({ ...s, publicDescription }));
            }}
          />
          <ThumbnailField>
            <AssetField
              commonTitle={t("Thumbnail")}
              inputMethod="asset"
              assetsTypes={IMAGE_TYPES}
              value={localPublicInfo.publicImage}
              onChange={publicImage => {
                setLocalPublicInfo(s => ({ ...s, publicImage }));
              }}
            />
            <StyledImage
              src={
                !localPublicInfo.publicImage ? defaultBetaProjectImage : localPublicInfo.publicImage
              }
            />
          </ThumbnailField>
          <ButtonWrapper>
            <Button title={t("Submit")} appearance="primary" onClick={handleSubmitPublicInfo} />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Basic Authorization")} size="large">
        <SettingsFields>
          <SwitchField
            commonTitle={t("Enable Basic Authorization")}
            value={localBasicAuthorization.isBasicAuthActive}
            onChange={isBasicAuthActive => {
              setBasicAuthorization(s => ({ ...s, isBasicAuthActive }));
            }}
          />
          <InputField
            commonTitle={t("Username")}
            value={settingsItem.basicAuthUsername}
            onChange={(basicAuthUsername: string) => {
              setBasicAuthorization(s => ({ ...s, basicAuthUsername }));
            }}
            disabled={!localBasicAuthorization.isBasicAuthActive}
          />
          <InputField
            commonTitle={t("Password")}
            value={settingsItem.basicAuthPassword}
            onChange={(basicAuthPassword: string) => {
              setBasicAuthorization(s => ({ ...s, basicAuthPassword }));
            }}
            disabled={!localBasicAuthorization.isBasicAuthActive}
          />
          <ButtonWrapper>
            <Button
              title={t("Submit")}
              appearance="primary"
              onClick={handleSubmitBasicAuthorization}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Site Setting")} size="large">
        <SettingsFields>
          <InputField
            commonTitle={t("Site name")}
            value={settingsItem.alias}
            onChange={(alias: string) => {
              setLocalAlias(alias);
            }}
            description={t(
              "You are about to change the site name for your project. Only alphanumeric characters and hyphens are allows.",
            )}
          />
          <ButtonWrapper>
            <Button title={t("Submit")} appearance="primary" onClick={handleSubmitAlias} />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Google Analytics")} size="large">
        <SettingsFields>
          <SwitchField
            commonTitle={t("Enable Google Analytics")}
            value={localGA.enableGa ?? false}
            onChange={(enableGa: boolean) => {
              setLocalGA(s => ({ ...s, enableGa }));
            }}
          />
          <InputField
            commonTitle={t("Tracking ID")}
            value={settingsItem.trackingId}
            onChange={(trackingId: string) => {
              setLocalGA(s => ({ ...s, trackingId }));
            }}
          />
          <ButtonWrapper>
            <Button title={t("Submit")} appearance="primary" onClick={handleSubmitGA} />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
    </>
  );
};

const ThumbnailField = styled.div`
  grid-template-rows: 100%;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 20px;
  display: inline-grid;
`;

const StyledImage = styled.img`
  width: 100%;
  border-radius: 4px;
`;

export default PublicSettingsDetail;
