import { useSettingsNavigation } from "@reearth/beta/hooks";
import { Button, Typography } from "@reearth/beta/lib/reearth-ui";
import { CommonField, SwitchField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { FC, useMemo } from "react";

import { Section, UrlText, UrlWrapper } from "../common";
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

  const handleNavigationToSettings = useSettingsNavigation({
    projectId: publishItem.projectId
  });

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
            `Your story will be published. This means anybody with the below URL will be able to view this story.`
          )
        : t(
            `Your scene will be published. This means anybody with the below URL will be able to view this scene.`
          );
  }, [t, publishItem]);

  return (
    <Section>
      <Typography size="body">{updateDescriptionText}</Typography>
      <CommonField title={t("Publish domain")}>
        {publicUrl && (
          <UrlWrapper onClick={() => window.open(publicUrl, "_blank")}>
            <UrlText hasPublicUrl>{publicUrl}</UrlText>
          </UrlWrapper>
        )}
      </CommonField>
      <CommonField title={t("Need to change domain related settings?")}>
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
      </CommonField>
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
