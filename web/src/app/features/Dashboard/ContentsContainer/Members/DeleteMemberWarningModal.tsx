import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useWorkspaceMutations } from "@reearth/services/api/workspace";
import { WorkspaceMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n/hooks";
import { Workspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useState } from "react";

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

  const [isRemoving, setIsRemoving] = useState(false);
  const { removeMemberFromWorkspace } = useWorkspaceMutations();

  const handleRemoveMember = useCallback(async () => {
    const userId = member?.user?.id;
    if (!userId || !workspace?.id || isRemoving) return;

    setIsRemoving(true);
    try {
      // Awaited so the modal can't close over a removal that failed — previously
      // it closed immediately and only a toast reported the failure.
      const result = await removeMemberFromWorkspace({
        workspaceId: workspace.id,
        userId
      });
      if (result.status === "success") onClose();
    } finally {
      setIsRemoving(false);
    }
  }, [
    member?.user?.id,
    workspace?.id,
    isRemoving,
    removeMemberFromWorkspace,
    onClose
  ]);

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
            disabled={isRemoving}
            onClick={handleRemoveMember}
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
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal,
  padding: theme.spacing.large
}));

const WarningIcon = styled(Icon)(({ theme }) => ({
  width: "24px",
  height: "24px",
  color: theme.warning.main
}));

const CancelButton = styled(Button)(() => ({
  whiteSpace: css.whiteSpace.nowrap
}));
