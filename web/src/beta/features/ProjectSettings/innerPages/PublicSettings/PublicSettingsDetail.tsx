import { IMAGE_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import { Typography } from "@reearth/beta/lib/reearth-ui";
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
import { useTheme } from "@reearth/services/styled";
import { styled } from "@reearth/services/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SettingsFields, SettingsWrapper, TitleWrapper } from "../common";

import AliasSetting from "./AliasSettings";

import {
  PublicAliasSettingsType,
  PublicBasicAuthSettingsType,
  PublicSettingsType,
  PublicGASettingsType,
  SettingsProject
} from ".";

interface WithTypename {
  type?: "project" | "story";
}

export type SettingsProjectWithTypename = SettingsProject & WithTypename;
export type StoryWithTypename = Story & WithTypename;

type Props = {
  settingsItem: (SettingsProject | Story) & WithTypename;
  isStory?: boolean;
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
  isStory,
  onUpdate,
  onUpdateBasicAuth,
  onUpdateAlias,
  onUpdateGA
}) => {
  const t = useT();
  const theme = useTheme();

  const [localPublicInfo, setLocalPublicInfo] = useState({
    publicTitle: settingsItem.publicTitle,
    publicDescription: settingsItem.publicDescription,
    publicImage: settingsItem.publicImage
  });

  const handleSubmitPublicInfo = useCallback(
    (publicImage?: string) => {
      onUpdate({
        ...localPublicInfo,
        publicImage
      });
    },
    [localPublicInfo, onUpdate]
  );

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
  }, [localGA.enableGa, localGA.trackingId, onUpdateGA]);

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

  const isPublished = useMemo(
    () =>
      settingsItem.publishmentStatus === "PUBLIC" ||
      settingsItem.publishmentStatus === "LIMITED",
    [settingsItem.publishmentStatus]
  );

  return (
    <SettingsWrapper>
      <SettingsFields>
        <HeadingWraper>
          <TitleWrapper size="body" weight="bold">
            {isPublished ? t("Public Info") : t("Published page settings")}
          </TitleWrapper>
          <Typography size="footnote" color={theme.content.weak}>
            {t(
              "This section's settings are mainly applied to the Open Graph Protocol settings in the header of the published page."
            )}
          </Typography>
        </HeadingWraper>

        <InputField
          title={t("Title")}
          description={t(
            "The Title setting will be applied to the <title> tag and og:title."
          )}
          value={settingsItem.publicTitle}
          onChange={(publicTitle: string) => {
            setLocalPublicInfo((s) => ({ ...s, publicTitle }));
          }}
          onChangeComplete={handleSubmitPublicInfo}
        />
        <TextAreaField
          title={t("Description")}
          value={settingsItem.publicDescription ?? ""}
          placeholder={t("Write down your text")}
          description={t(
            "The Description setting will be applied to og:description."
          )}
          resizable="height"
          onChange={(publicDescription: string) => {
            setLocalPublicInfo((s) => ({ ...s, publicDescription }));
          }}
          onChangeComplete={handleSubmitPublicInfo}
        />
        <ThumbnailField>
          <AssetField
            title={t("Thumbnail")}
            placeholder={t("Image url")}
            description={t(
              "The Thumbnail setting will be applied to og:image."
            )}
            inputMethod="asset"
            assetsTypes={IMAGE_TYPES}
            value={localPublicInfo.publicImage}
            onChange={(publicImage) => {
              setLocalPublicInfo((s) => ({
                ...s,
                publicImage: publicImage ?? ""
              }));
              handleSubmitPublicInfo(publicImage);
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
      </SettingsFields>
      <SettingsFields>
        <TitleWrapper size="body" weight="bold">
          {t("Alias Setting")}
        </TitleWrapper>
        {isPublished ? (
          <AliasSetting
            isStory={isStory}
            settingsItem={settingsItem}
            onUpdateAlias={onUpdateAlias}
          />
        ) : (
          <ContentDescription>
            <Typography size="body" color={theme.content.weak}>
              {isStory
                ? t("Please publish your story before setting up your alias.")
                : t(
                    "Please publish your map project before setting up your alias."
                  )}
            </Typography>
          </ContentDescription>
        )}
      </SettingsFields>
      {extensions &&
        extensions.filter((ext) => ext.type === "publication").length > 0 &&
        accessToken && (
          <SettingsFields>
            <TitleWrapper size="body" weight="bold">
              {t("Custom Domain")}
            </TitleWrapper>

            {isPublished ? (
              <ExtensionComponent
                typename={settingsItem.type || ""}
                {...(settingsItem.type === "project"
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
            ) : (
              <ContentDescription>
                <Typography size="body" color={theme.content.weak}>
                  {isStory
                    ? t(
                        "Please publish your map story before setting up your custom domain."
                      )
                    : t(
                        "Please publish your map project before setting up your custom domain."
                      )}
                </Typography>
              </ContentDescription>
            )}
          </SettingsFields>
        )}
      <SettingsFields>
        <TitleWrapper size="body" weight="bold">
          {t("Basic Authorization")}
        </TitleWrapper>
        <SwitchField
          title={t("Enable Basic Authorization")}
          value={localBasicAuthorization.isBasicAuthActive}
          onChange={(isBasicAuthActive) => {
            setBasicAuthorization((s) => ({ ...s, isBasicAuthActive }));
          }}
        />
        {localBasicAuthorization.isBasicAuthActive && (
          <>
            <InputField
              title={t("Username")}
              value={settingsItem.basicAuthUsername}
              onChange={(basicAuthUsername: string) => {
                setBasicAuthorization((s) => ({ ...s, basicAuthUsername }));
              }}
              disabled={!localBasicAuthorization.isBasicAuthActive}
              onChangeComplete={handleSubmitBasicAuthorization}
            />
            <InputField
              title={t("Password")}
              value={settingsItem.basicAuthPassword}
              onChange={(basicAuthPassword: string) => {
                setBasicAuthorization((s) => ({ ...s, basicAuthPassword }));
              }}
              disabled={!localBasicAuthorization.isBasicAuthActive}
              onChangeComplete={handleSubmitBasicAuthorization}
            />
          </>
        )}
      </SettingsFields>
      <SettingsFields>
        <TitleWrapper size="body" weight="bold">
          {t("Google Analytics")}
        </TitleWrapper>
        <SwitchField
          title={t("Enable Google Analytics")}
          value={localGA.enableGa ?? false}
          onChange={(enableGa: boolean) => {
            setLocalGA((s) => ({ ...s, enableGa }));
          }}
        />
        {localGA.enableGa && (
          <InputField
            title={t("Tracking ID")}
            value={settingsItem.trackingId}
            onChange={(trackingId: string) => {
              setLocalGA((s) => ({ ...s, trackingId }));
            }}
            onChangeComplete={handleSubmitGA}
          />
        )}
      </SettingsFields>
    </SettingsWrapper>
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

const HeadingWraper = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const ContentDescription = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: `${theme.spacing.super}px 0`
}));

export default PublicSettingsDetail;
