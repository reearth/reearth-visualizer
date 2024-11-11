import { Button, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import {
  useProjectFetcher,
  useStorytellingFetcher
} from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo } from "react";

import { Header, Section, Subtitle, WarningIcon } from "../common";
import { PublishItem } from "../hooks";

type Props = {
  publishItem: PublishItem;
  onClose: () => void;
};

const UnpublishModal: FC<Props> = ({ publishItem, onClose }) => {
  const t = useT();

  const { usePublishProject: publishProject } = useProjectFetcher();
  const { usePublishStory: publishStory } = useStorytellingFetcher();

  const handleUnpublish = useCallback(async () => {
    if (publishItem.type === "story") {
      await publishStory("unpublished", publishItem.storyId);
    } else {
      await publishProject("unpublished", publishItem.projectId);
    }
    onClose();
  }, [publishItem, onClose, publishProject, publishStory]);

  const actions = useMemo(
    () => (
      <>
        <Button title={t("Cancel")} appearance="secondary" onClick={onClose} />
        <Button
          title={t("Unpublish")}
          appearance="primary"
          onClick={handleUnpublish}
        />
      </>
    ),
    [onClose, handleUnpublish, t]
  );

  return (
    <Modal size="small" visible>
      <ModalPanel actions={actions} onCancel={onClose} appearance={"simple"}>
        <Section>
          <Header>
            <WarningIcon icon="warning" />
          </Header>
          <Subtitle size="body">
            {publishItem.type === "story"
              ? t(`Your story will be unpublished.`)
              : t(`Your scene will be unpublished.`)}
          </Subtitle>
          <Subtitle size="body">
            {publishItem.type === "story"
              ? t(
                  `This means that anybody with the URL will become unable to view this story. This includes websites where this story is embedded.`
                )
              : t(
                  `This means that anybody with the URL will become unable to view this scene. This includes websites where this scene is embedded.`
                )}
          </Subtitle>
        </Section>
      </ModalPanel>
    </Modal>
  );
};

export default UnpublishModal;
