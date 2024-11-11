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
import useAlias from "./useAlias";

type Props = {
  publishItem: PublishItem;
  onClose: () => void;
};

const PublishOrUpdateModal: FC<Props> = ({ publishItem, onClose }) => {
  const t = useT();

  const [publishDone, setPublishDone] = useState(false);

  const { usePublishProject: publishProject } = useProjectFetcher();
  const { usePublishStory: publishStory } = useStorytellingFetcher();

  // search engine index
  const [searchEngineIndexEnabled, setSearchEngineIndexEnabled] = useState(
    publishItem.publishmentStatus === "PUBLIC"
  );

  const { alias, aliasValid } = useAlias({ publishItem });

  const handleProjectPublish = useCallback(async () => {
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
    return publishDone
      ? t("Congratulations!")
      : !publishItem.isPublished
        ? publishItem.type === "story"
          ? t(`Publish your story`)
          : t(`Publish your scene`)
        : publishItem.type === "story"
          ? t(`Update your story`)
          : t(`Update your scene`);
  }, [t, publishDone, publishItem]);

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
            disabled={!aliasValid}
            onClick={handleProjectPublish}
          />
        )}
      </>
    ),
    [
      onClose,
      handleProjectPublish,
      aliasValid,
      primaryButtonText,
      secondaryButtonText,
      publishDone
    ]
  );

  const publicUrl = useMemo(() => {
    const url = config()?.published?.split("{}");
    return (
      (url?.[0] ?? "") + (alias?.replace("/", "") ?? "") + (url?.[1] ?? "")
    );
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
            isStory={publishItem.type === "story"}
            publicUrl={publicUrl}
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
