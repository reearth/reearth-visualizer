import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useWorkspaceFetcher } from "@reearth/services/api";
import { WorkspaceMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { Workspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, useCallback } from "react";

type DeleteMemberWarningModalProps = {
  visible: boolean;
  onClose: () => void;
  workspace: Workspace | undefined;
  member: WorkspaceMember | undefined;
};

const DeleteMemberWarningModal: FC<DeleteMemberWarningModalProps> = ({
  visible,
  onClose,
  workspace,
  member
}) => {
  const t = useT();

  const { useRemoveMemberFromWorkspace: removeMember } = useWorkspaceFetcher();
  const onRemoveMember = useCallback(
    (userId: string) => {
      if (!userId || !workspace?.id) return;
      removeMember({ workspaceId: workspace?.id, userId });
    },
    [workspace?.id, removeMember]
  );
  const handleRemoveMember = useCallback(() => {
    if (!member?.user?.id) return;
    onRemoveMember(member.user?.id);
    onClose();
  }, [member?.user?.id, onClose, onRemoveMember]);

  return (
    <Modal visible={visible} size="small">
      <ModalPanel
        actions={[
          <CancelButton
            key="cancel"
            title={t("Cancel")}
            appearance="secondary"
            onClick={onClose}
          />,
          <Button
            key="remove"
            title={t("Remove")}
            appearance="dangerous"
            disabled={false}
            onClick={() => handleRemoveMember()}
          />
        ]}
        appearance="simple"
      >
        <ModalContentWrapper>
          <WarningIcon icon="warning" />
          <Typography size="body">
            {t("Your are removing member ")}
            <strong>{member?.user?.name}</strong>
            {t(" out of this workspace. Are you sure you want to do that?")}
          </Typography>
        </ModalContentWrapper>
      </ModalPanel>
    </Modal>
  );
};

export default DeleteMemberWarningModal;

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

const CancelButton = styled(Button)(() => ({
  whiteSpace: "nowrap"
}));
