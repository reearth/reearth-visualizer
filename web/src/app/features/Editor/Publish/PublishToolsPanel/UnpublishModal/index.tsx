import { Button, Modal, ModalPanel } from "@reearth/app/lib/reearth-ui";
import { useProjectMutations } from "@reearth/services/api/project";
import { useStoryMutations } from "@reearth/services/api/storytelling";
import { useT } from "@reearth/services/i18n/hooks";
import { FC, useCallback, useMemo, useState } from "react";

import { Header, Section, Subtitle, WarningIcon } from "../common";
import { PublishItem } from "../hooks";

type Props = {
  publishItem: PublishItem;
  onClose: () => void;
};

const UnpublishModal: FC<Props> = ({ publishItem, onClose }) => {
  const t = useT();

  const { publishProject } = useProjectMutations();
  const { publishStory } = useStoryMutations();

  const [isLoading, setIsLoading] = useState(false);
  const handleUnpublish = useCallback(async () => {
    setIsLoading(true);
    if (publishItem.type === "story") {
      await publishStory("unpublished", publishItem.storyId);
    } else {
      await publishProject("unpublished", publishItem.projectId);
    }
    setIsLoading(false);
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
          disabled={isLoading}
        />
      </>
    ),
    [onClose, handleUnpublish, t, isLoading]
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
