import { Button, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import {
  useProjectFetcher,
  useStorytellingFetcher
} from "@reearth/services/api";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo, useState } from "react";

import { PublishItem } from "../hooks";

import PublishedOrUpdatedSection from "./PublishedOrUpdatedSection";
import PublishOrUpdateSection from "./PublishOrUpdateSection";

type Props = {
  publishItem: PublishItem;
  isPublishMode: boolean;
  onClose: () => void;
};

const PublishOrUpdateModal: FC<Props> = ({
  publishItem,
  isPublishMode,
  onClose
}) => {
  const t = useT();

  const [publishDone, setPublishDone] = useState(false);

  const { usePublishProject: publishProject } = useProjectFetcher();
  const { usePublishStory: publishStory } = useStorytellingFetcher();

  // search engine index
  const [searchEngineIndexEnabled, setSearchEngineIndexEnabled] = useState(
    publishItem.publishmentStatus === "PUBLIC"
  );

  const alias = useMemo(
    () => (publishItem.alias ? publishItem.alias : publishItem.id),
    [publishItem.alias, publishItem.id]
  );

  const [isPublishing, setIsPublishing] = useState(false);
  const handleProjectPublish = useCallback(async () => {
    setIsPublishing(true);
    if (publishItem.type === "story") {
      await publishStory(
        searchEngineIndexEnabled ? "published" : "limited",
        publishItem.storyId,
        alias
      );
    } else {
      await publishProject(
        searchEngineIndexEnabled ? "published" : "limited",
        publishItem.projectId,
        alias
      );
    }
    setIsPublishing(false);
    setPublishDone(true);
  }, [
    alias,
    searchEngineIndexEnabled,
    publishItem.type,
    publishItem.storyId,
    publishItem.projectId,
    publishProject,
    publishStory
  ]);

  const title = useMemo(() => {
    const isStory = publishItem.type === "story";
    if (isPublishMode) {
      return isStory ? t("Publish your story") : t("Publish your scene");
    }
    return isStory ? t("Update your story") : t("Update your scene");
  }, [publishItem.type, isPublishMode, t]);

  const primaryButtonText = useMemo(() => {
    return !publishItem.isPublished ? t("Publish") : t("Update");
  }, [t, publishItem]);

  const secondaryButtonText = useMemo(
    () => (!publishDone ? t("Cancel") : t("Ok")),
    [t, publishDone]
  );

  const actions = useMemo(
    () => (
      <>
        <Button
          title={secondaryButtonText}
          appearance={publishDone ? "primary" : "secondary"}
          onClick={onClose}
        />
        {!publishDone && (
          <Button
            title={primaryButtonText}
            appearance="primary"
            disabled={isPublishing}
            onClick={handleProjectPublish}
          />
        )}
      </>
    ),
    [
      onClose,
      handleProjectPublish,
      primaryButtonText,
      secondaryButtonText,
      publishDone,
      isPublishing
    ]
  );

  const publicUrl = useMemo(() => {
    const publishedConfig = config()?.published;
    if (!publishedConfig) return "";

    const [prefix, suffix] = publishedConfig.split("{}");
    const sanitizedAlias = alias?.replace(/^\/+|\/+$/g, "") ?? "";

    return `${prefix}${sanitizedAlias}${suffix}`;
  }, [alias]);

  return (
    <Modal size="small" visible>
      <ModalPanel
        title={title}
        actions={actions}
        onCancel={onClose}
        appearance="normal"
      >
        {publishDone ? (
          <PublishedOrUpdatedSection
            publishItem={publishItem}
            publicUrl={publicUrl}
            isPublishMode={isPublishMode}
          />
        ) : (
          <PublishOrUpdateSection
            publishItem={publishItem}
            publicUrl={publicUrl}
            searchEngineIndexEnabled={searchEngineIndexEnabled}
            handleSearchIndexEnableChange={setSearchEngineIndexEnabled}
          />
        )}
      </ModalPanel>
    </Modal>
  );
};

export default PublishOrUpdateModal;
