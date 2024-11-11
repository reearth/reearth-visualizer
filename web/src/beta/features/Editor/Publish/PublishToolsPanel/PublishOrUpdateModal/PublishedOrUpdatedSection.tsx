import { Typography } from "@reearth/beta/lib/reearth-ui";
import { CommonField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo } from "react";

import { Section, Subtitle, UrlText, UrlWrapper } from "../common";

type Props = {
  isStory?: boolean;
  publicUrl?: string;
};

const PublishedOrUpdatedSection: FC<Props> = ({ isStory, publicUrl }) => {
  const t = useT();
  const theme = useTheme();

  const embedCode = useMemo(
    () =>
      `<iframe width="560" height="315" src="${publicUrl}" frameBorder="0"></iframe>;`,
    [publicUrl]
  );

  const handleCopyToClipBoard = useCallback(
    (value: string | undefined) => () => {
      if (!value) return;
      navigator.clipboard.writeText(value);
    },
    []
  );

  return (
    <Section>
      <Subtitle size="body">
        {isStory
          ? t(`Your story has been published!`)
          : t(`Your scene has been published!`)}
      </Subtitle>
      <CommonField
        title={t("Public URL")}
        description={
          isStory
            ? t(`* Anyone can see your story with this URL`)
            : t(`* Anyone can see your scene with this URL`)
        }
      >
        <UrlWrapper justify="space-between">
          <UrlText
            hasPublicUrl
            onClick={() => window.open(publicUrl, "_blank")}
          >
            {publicUrl}
          </UrlText>
          <Typography
            size="body"
            color={theme.primary.main}
            onClick={handleCopyToClipBoard(publicUrl)}
          >
            {t("Copy")}
          </Typography>
        </UrlWrapper>
      </CommonField>
      <CommonField
        title={t("Embed Code")}
        description={
          isStory
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
          <Typography
            size="body"
            color={theme.primary.main}
            onClick={handleCopyToClipBoard(embedCode)}
          >
            {t("Copy")}
          </Typography>
        </UrlWrapper>
      </CommonField>
    </Section>
  );
};

export default PublishedOrUpdatedSection;
