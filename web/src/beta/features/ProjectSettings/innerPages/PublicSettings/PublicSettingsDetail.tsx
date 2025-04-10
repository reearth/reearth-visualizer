import { IMAGE_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import { Button, Collapse } from "@reearth/beta/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/beta/ui/assets/defaultProjectBackgroundImage.webp";
import { AssetField, InputField, SwitchField } from "@reearth/beta/ui/fields";
import TextAreaField from "@reearth/beta/ui/fields/TextareaField";
import { Story } from "@reearth/services/api/storytellingApi/utils";
import { useAuth } from "@reearth/services/auth";
import {
  ProjectPublicationExtensionProps,
  StoryPublicationExtensionProps
} from "@reearth/services/config/extensions";
import { useLang, useT } from "@reearth/services/i18n";
import {
  NotificationType,
  useCurrentTheme,
  useNotification
} from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { useCallback, useEffect, useState } from "react";

import { SettingsFields, ButtonWrapper } from "../common";

import {
  PublicAliasSettingsType,
  PublicBasicAuthSettingsType,
  PublicSettingsType,
  PublicGASettingsType,
  SettingsProject
} from ".";

interface WithTypename {
  __typename?: string;
}

type SettingsProjectWithTypename = SettingsProject & WithTypename;
type StoryWithTypename = Story & WithTypename;

type Props = {
  settingsItem: SettingsProjectWithTypename | StoryWithTypename;
  onUpdate: (settings: PublicSettingsType) => void;
  onUpdateBasicAuth: (settings: PublicBasicAuthSettingsType) => void;
  onUpdateAlias: (settings: PublicAliasSettingsType) => void;
  onUpdateGA?: (settings: PublicGASettingsType) => void;
};

type ExtensionComponentProps = (
  | ProjectPublicationExtensionProps
  | StoryPublicationExtensionProps
) & {
  typename: string;
};

const PublicSettingsDetail: React.FC<Props> = ({
  settingsItem,
  onUpdate,
  onUpdateBasicAuth,
  onUpdateAlias,
  onUpdateGA
}) => {
  const t = useT();

  const [localPublicInfo, setLocalPublicInfo] = useState({
    publicTitle: settingsItem.publicTitle,
    publicDescription: settingsItem.publicDescription,
    publicImage: settingsItem.publicImage
  });
  const handleSubmitPublicInfo = useCallback(() => {
    onUpdate({
      ...localPublicInfo
    });
  }, [localPublicInfo, onUpdate]);

  const [localBasicAuthorization, setBasicAuthorization] = useState({
    isBasicAuthActive: !!settingsItem.isBasicAuthActive,
    basicAuthUsername: settingsItem.basicAuthUsername,
    basicAuthPassword: settingsItem.basicAuthPassword
  });
  const handleSubmitBasicAuthorization = useCallback(() => {
    onUpdateBasicAuth({
      ...localBasicAuthorization
    });
  }, [localBasicAuthorization, onUpdateBasicAuth]);

  const [localAlias, setLocalAlias] = useState(settingsItem.alias);
  const handleSubmitAlias = useCallback(() => {
    onUpdateAlias({
      alias: localAlias
    });
  }, [localAlias, onUpdateAlias]);

  const [localGA, setLocalGA] = useState<PublicGASettingsType>({
    enableGa: settingsItem.enableGa,
    trackingId: settingsItem.trackingId
  });

  const handleSubmitGA = useCallback(() => {
    if (onUpdateGA) {
      onUpdateGA({
        enableGa: localGA.enableGa,
        trackingId: localGA.trackingId
      });
    }
  }, [localGA, onUpdateGA]);

  const extensions = window.REEARTH_CONFIG?.extensions?.publication;
  const [accessToken, setAccessToken] = useState<string>();
  const { getAccessToken } = useAuth();
  const currentLang = useLang();
  const [currentTheme] = useCurrentTheme();

  useEffect(() => {
    getAccessToken().then((token) => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  const [, setNotification] = useNotification();
  const onNotificationChange = useCallback(
    (type: NotificationType, text: string, heading?: string) => {
      setNotification({ type, text, heading });
    },
    [setNotification]
  );

  const ExtensionComponent = (props: ExtensionComponentProps) => {
    const type = props.typename.toLocaleLowerCase();
    const extensionId = `custom-${type}-domain`;
    const Component = extensions?.find((e) => e.id === extensionId)?.component;
    if (!Component) {
      return null;
    }
    return <Component {...props} />;
  };

  return (
    <>
      <Collapse title={t("Public Info")} size="large" noShrink>
        <SettingsFields>
          <InputField
            title={t("Title")}
            value={settingsItem.publicTitle}
            onChange={(publicTitle: string) => {
              setLocalPublicInfo((s) => ({ ...s, publicTitle }));
            }}
          />
          <TextAreaField
            title={t("Description")}
            value={localPublicInfo.publicDescription ?? ""}
            resizable="height"
            onChange={(publicDescription: string) => {
              setLocalPublicInfo((s) => ({ ...s, publicDescription }));
            }}
          />
          <ThumbnailField>
            <AssetField
              title={t("Thumbnail")}
              inputMethod="asset"
              assetsTypes={IMAGE_TYPES}
              value={localPublicInfo.publicImage}
              onChange={(publicImage) => {
                setLocalPublicInfo((s) => ({
                  ...s,
                  publicImage: publicImage ?? ""
                }));
              }}
            />
            <StyledImage
              src={
                !localPublicInfo.publicImage
                  ? defaultProjectBackgroundImage
                  : localPublicInfo.publicImage
              }
            />
          </ThumbnailField>
          <ButtonWrapper>
            <Button
              title={t("Submit")}
              appearance="primary"
              onClick={handleSubmitPublicInfo}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Basic Authorization")} size="large" noShrink>
        <SettingsFields>
          <SwitchField
            title={t("Enable Basic Authorization")}
            value={localBasicAuthorization.isBasicAuthActive}
            onChange={(isBasicAuthActive) => {
              setBasicAuthorization((s) => ({ ...s, isBasicAuthActive }));
            }}
          />
          <InputField
            title={t("Username")}
            value={settingsItem.basicAuthUsername}
            onChange={(basicAuthUsername: string) => {
              setBasicAuthorization((s) => ({ ...s, basicAuthUsername }));
            }}
            disabled={!localBasicAuthorization.isBasicAuthActive}
          />
          <InputField
            title={t("Password")}
            value={settingsItem.basicAuthPassword}
            onChange={(basicAuthPassword: string) => {
              setBasicAuthorization((s) => ({ ...s, basicAuthPassword }));
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
      <Collapse title={t("Site Setting")} size="large" noShrink>
        <SettingsFields>
          <InputField
            title={t("Site name")}
            value={settingsItem.alias}
            onChange={(alias: string) => {
              setLocalAlias(alias);
            }}
            description={t(
              "You are about to change the site name for your project. Only alphanumeric characters and hyphens are allows."
            )}
          />
          <ButtonWrapper>
            <Button
              title={t("Submit")}
              appearance="primary"
              onClick={handleSubmitAlias}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      <Collapse title={t("Google Analytics")} size="large" noShrink>
        <SettingsFields>
          <SwitchField
            title={t("Enable Google Analytics")}
            value={localGA.enableGa ?? false}
            onChange={(enableGa: boolean) => {
              setLocalGA((s) => ({ ...s, enableGa }));
            }}
          />
          <InputField
            title={t("Tracking ID")}
            value={settingsItem.trackingId}
            onChange={(trackingId: string) => {
              setLocalGA((s) => ({ ...s, trackingId }));
            }}
          />
          <ButtonWrapper>
            <Button
              title={t("Submit")}
              appearance="primary"
              onClick={handleSubmitGA}
            />
          </ButtonWrapper>
        </SettingsFields>
      </Collapse>
      {extensions && extensions.length > 0 && accessToken && (
        <Collapse title={t("Custom Domain")} size="large" noShrink>
          <ExtensionComponent
            typename={settingsItem.__typename || ""}
            {...(settingsItem.__typename === "Project"
              ? {
                  projectId: settingsItem.id,
                  projectAlias: settingsItem.alias
                }
              : {
                  storyId: settingsItem.id,
                  storyAlias: settingsItem.alias
                })}
            lang={currentLang}
            theme={currentTheme}
            accessToken={accessToken}
            onNotificationChange={onNotificationChange}
            version="visualizer"
          />
        </Collapse>
      )}
    </>
  );
};

const ThumbnailField = styled.div`
  grid-template-rows: 100%;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 20px;
  display: inline-grid;
`;

const StyledImage = styled("img")(({ theme }) => ({
  width: "100%",
  borderRadius: theme.radius.normal,
  backgroundColor: theme.relative.dark
}));

export default PublicSettingsDetail;
