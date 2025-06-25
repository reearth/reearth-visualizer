import { useSettingsNavigation } from "@reearth/app/hooks";
import { Button, Icon, Typography } from "@reearth/app/lib/reearth-ui";
import { CommonField } from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import {
  PublicUrlWrapper,
  PublishStatus,
  Section,
  Subtitle,
  UrlAction,
  UrlText,
  UrlWrapper
} from "../common";
import { PublishItem } from "../hooks";

type Props = {
  publishItem: PublishItem;
  publicUrl: string;
  isPublishMode: boolean;
};

const PublishedOrUpdatedSection: FC<Props> = ({
  publishItem,
  publicUrl,
  isPublishMode
}) => {
  const t = useT();
  const theme = useTheme();

  const handleNavigationToSettings = useSettingsNavigation({
    projectId: publishItem.projectId
  });

  const embedCode = useMemo(
    () =>
      `<iframe width="560" height="315" src="${publicUrl}" frameBorder="0"></iframe>`,
    [publicUrl]
  );

  const [urlCopied, setUrlCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyToClipBoard = useCallback((value: string | undefined) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
  }, []);

  const title = useMemo(() => {
    const isStory = publishItem.type === "story";
    if (isPublishMode) {
      return isStory
        ? t("Congratulations! 🎊 Your story has been published")
        : t("Congratulations! 🎊 Your scene has been published");
    }
    return isStory
      ? t("Congratulations! 🎊 Your story has been updated")
      : t("Congratulations! 🎊 Your scene has been updated");
  }, [publishItem.type, isPublishMode, t]);

  return (
    <Section>
      <Subtitle size="body">
        <>
          {title} <br />
          {t("Please visit your project by URL below !")}
        </>
      </Subtitle>
      <PublicUrlWrapper>
        <PublishStatus isPublished />
        <UrlWrapper justify="space-between">
          <UrlText
            hasPublicUrl
            onClick={() => window.open(publicUrl, "_blank")}
          >
            {publicUrl}
          </UrlText>
          <UrlAction
            onClick={() => {
              handleCopyToClipBoard(publicUrl);
              setUrlCopied(true);
            }}
            onMouseLeave={() => setUrlCopied(false)}
          >
            {urlCopied ? (
              <Icon icon="check" color={theme.primary.main} />
            ) : (
              <Icon icon="copy" />
            )}
          </UrlAction>
        </UrlWrapper>
      </PublicUrlWrapper>

      <CommonField
        title={t("Embed Code")}
        description={
          publishItem.type === "story"
            ? t(
                `* Please use this code if you want to embed your story into a webpage`
              )
            : t(
                `* Please use this code if you want to embed your scene into a webpage`
              )
        }
      >
        <UrlWrapper justify="space-between">
          <UrlText>{embedCode}</UrlText>
          <UrlAction
            onClick={() => {
              handleCopyToClipBoard(embedCode);
              setCodeCopied(true);
            }}
            onMouseLeave={() => setCodeCopied(false)}
          >
            {codeCopied ? (
              <Icon icon="check" color={theme.primary.main} />
            ) : (
              <Icon icon="copy" />
            )}
          </UrlAction>
        </UrlWrapper>
      </CommonField>
      <SettingWrapper>
        <Typography size="body">
          {t("Want to change public settings?")}
        </Typography>
        <Button
          size="small"
          onClick={() =>
            handleNavigationToSettings?.(
              "public",
              publishItem.type === "story" ? publishItem.storyId : ""
            )
          }
          title={t("Go to settings")}
        />
      </SettingWrapper>
    </Section>
  );
};

export default PublishedOrUpdatedSection;

const SettingWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}));
