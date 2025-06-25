import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type DeleteWorkspaceWarningModalProps = {
  visible: boolean;
  onClose: () => void;
};

const DeleteWorkspaceWarningModal: FC<DeleteWorkspaceWarningModalProps> = ({
  visible,
  onClose
}) => {
  const t = useT();

  return (
    <Modal visible={visible} size="small">
      <ModalPanel
        actions={
          <Button
            key="ok"
            title={t("Ok")}
            appearance="secondary"
            onClick={onClose}
          />
        }
        appearance="simple"
      >
        <ModalContentWrapper>
          <WarningIcon icon="warning" />
          <Typography size="body">
            {t("You are going to delete a workspace.")}
          </Typography>
          <Typography size="body">
            {t(
              "Please make sure you don't have any projects in the workspace before continuing."
            )}
          </Typography>
        </ModalContentWrapper>
      </ModalPanel>
    </Modal>
  );
};

export default DeleteWorkspaceWarningModal;

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  padding: theme.spacing.large
}));

const WarningIcon = styled(Icon)(({ theme }) => ({
  width: "24px",
  height: "24px",
  color: theme.warning.main
}));
