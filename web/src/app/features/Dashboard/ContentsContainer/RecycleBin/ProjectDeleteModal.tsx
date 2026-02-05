import {
  Button,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

type Props = {
  isVisible: boolean;
  projectName: string;
  disabled?: boolean;
  onClose: () => void;
  onProjectDelete: () => void;
};
const ProjectDeleteModal: FC<Props> = ({
  isVisible,
  projectName,
  disabled,
  onClose,
  onProjectDelete
}) => {
  const t = useT();
  const [deleteInputName, setDeleteInputName] = useState("");

  return (
    <Modal visible={isVisible} size="small">
      <ModalPanel
        title={t("Delete project")}
        onCancel={onClose}
        actions={[
          <Button
            key="cancel"
            title={t("Cancel")}
            appearance="secondary"
            onClick={onClose}
          />,
          <Button
            key="delete"
            title={t("I am sure I want to delete this project")}
            appearance="dangerous"
            disabled={deleteInputName !== projectName || disabled}
            onClick={onProjectDelete}
          />
        ]}
      >
        <ModalContentWrapper>
          <Typography size="body" weight="bold">
            {projectName}
          </Typography>
          <Typography size="body">
            {t(
              "This action cannot be undone. This will permanently delete the project totally. You will lose all your project data"
            )}
          </Typography>
          <Typography size="body">
            {t("Please type your project name to continue.")}
          </Typography>
          <TextInput onChange={(name) => setDeleteInputName(name)} />
        </ModalContentWrapper>
      </ModalPanel>
    </Modal>
  );
};

export default ProjectDeleteModal;

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.normal,
  background: theme.bg[1]
}));
