import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { SwitchField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import {
  PublicUrlWrapper,
  PublishStatus,
  Section,
  UrlAction,
  UrlText,
  UrlWrapper
} from "../common";
import { PublishItem } from "../hooks";

type Props = {
  publishItem: PublishItem;
  publicUrl: string;
  searchEngineIndexEnabled: boolean;
  handleSearchIndexEnableChange: (checked: boolean) => void;
};

const PublishOrUpdateSection: FC<Props> = ({
  publishItem,
  publicUrl,
  searchEngineIndexEnabled,
  handleSearchIndexEnableChange
}) => {
  const t = useT();
  const theme = useTheme();

  const [urlCopied, setUrlCopied] = useState(false);

  const handleCopyToClipBoard = useCallback((value: string | undefined) => {
    if (!value) return;
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${value}`;
    navigator.clipboard.writeText(fullUrl);
  }, []);

  const updateDescriptionText = useMemo(() => {
    return publishItem.isPublished
      ? publishItem.type === "story"
        ? t(
            `Your published story will be updated. This means all current changes will overwrite the current published story.`
          )
        : t(
            `Your published scene will be updated. This means all current changes will overwrite the current published scene.`
          )
      : publishItem.type === "story"
        ? t(
            `Your story will be published. This means anybody can view this story by default url.`
          )
        : t(
            `Your scene will be published. This means anybody can view this project by default url.`
          );
  }, [t, publishItem]);

  return (
    <Section>
      <Typography size="body">{updateDescriptionText}</Typography>
      {publishItem.isPublished && (
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
      )}

      <SwitchField
        title={t("Search engine indexing")}
        description={t("Page will be available as result on search engines")}
        value={searchEngineIndexEnabled}
        onChange={handleSearchIndexEnableChange}
      />
    </Section>
  );
};

export default PublishOrUpdateSection;
