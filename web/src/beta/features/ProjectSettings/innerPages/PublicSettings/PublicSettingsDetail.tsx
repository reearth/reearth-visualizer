import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import TextAreaField from "@reearth/beta/components/fields/TextAreaField";
import TextInput from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import URLField from "@reearth/beta/components/fields/URLField";
import defaultBetaProjectImage from "@reearth/classic/components/atoms/Icon/Icons/defaultBetaProjectImage.png";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

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

  const [localGA, setLocalGA] = useState({
    enableGA: !!settingsItem.enableGA,
    trackingid: settingsItem.trackingid,
  });
  const handleSubmitGA = useCallback(() => {
    if (onUpdateGA) {
      onUpdateGA({
        ...localGA,
      });
    }
  }, [localGA, onUpdateGA]);

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
          />
          <TextAreaField
            name={t("Description")}
            value={localPublicInfo.publicDescription ?? ""}
            onChange={(publicDescription: string) => {
              setLocalPublicInfo(s => ({ ...s, publicDescription }));
            }}
            minHeight={108}
          />
          <ThumbnailField>
            <URLField
              name={t("Thumbnail")}
              fileType="asset"
              entityType="image"
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
          <ToggleField
            name={t("Enable Basic Authorization")}
            checked={localBasicAuthorization.isBasicAuthActive}
            onChange={isBasicAuthActive => {
              setBasicAuthorization(s => ({ ...s, isBasicAuthActive }));
            }}
          />
          <TextInput
            name={t("Username")}
            value={settingsItem.basicAuthUsername}
            onChange={(basicAuthUsername: string) => {
              setBasicAuthorization(s => ({ ...s, basicAuthUsername }));
            }}
            disabled={!localBasicAuthorization.isBasicAuthActive}
          />
          <TextInput
            name={t("Password")}
            value={settingsItem.basicAuthPassword}
            onChange={(basicAuthPassword: string) => {
              setBasicAuthorization(s => ({ ...s, basicAuthPassword }));
            }}
            disabled={!localBasicAuthorization.isBasicAuthActive}
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
      <Collapse title={t("Google Analytics")}>
        <SettingsFields>
          <ToggleField
            name={t("Enable Google Analytics")}
            checked={localGA.enableGA}
            onChange={enableGA => {
              setLocalGA(s => ({ ...s, enableGA }));
            }}
          />
          <TextInput
            name={t("Tracking ID")}
            value={settingsItem.trackingid}
            onChange={(trackingid: string) => {
              setLocalGA(s => ({ ...s, trackingid }));
            }}
          />
          <ButtonWrapper>
            <Button
              text={t("Submit")}
              size="medium"
              margin="0"
              buttonType="primary"
              onClick={handleSubmitGA}
            />
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
