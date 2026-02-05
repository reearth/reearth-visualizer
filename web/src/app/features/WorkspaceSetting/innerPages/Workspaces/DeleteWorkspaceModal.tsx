import {
  Button,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useWorkspaceMutations } from "@reearth/services/api/workspace";
import { useT } from "@reearth/services/i18n/hooks";
import { useWorkspace, Workspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

type DeleteWorkspaceModalProps = {
  visible: boolean;
  workspace: Workspace | undefined;
  onClose: () => void;
};

const DeleteWorkspaceModal: FC<DeleteWorkspaceModalProps> = ({
  visible,
  workspace,
  onClose
}) => {
  const t = useT();
  const navigate = useNavigate();
  const [_, setWorkspace] = useWorkspace();
  const { deleteWorkspace } = useWorkspaceMutations();

  const [workspaceNameConfirm, setWorkspaceNameConfirm] = useState<string>("");

  const handleDeleteWorkspace = useCallback(async () => {
    if (!workspace?.id) return;
    await deleteWorkspace({ workspaceId: workspace.id });
    onClose();
    setWorkspace(undefined);
    navigate(`/`);
  }, [workspace, deleteWorkspace, setWorkspace, navigate, onClose]);

  useEffect(() => {
    if (!visible) {
      setWorkspaceNameConfirm("");
    }
  }, [visible]);

  return (
    <Modal visible={visible} size="small">
      <ModalPanel
        title={t("Delete workspace")}
        layout="common"
        onCancel={onClose}
        actions={[
          <CancelButton
            key="cancel"
            title={t("Cancel")}
            appearance="secondary"
            onClick={onClose}
          />,
          <Button
            key="delete"
            title={t("I am sure I want to delete this workspace.")}
            appearance="dangerous"
            disabled={workspaceNameConfirm.trim() !== workspace?.name?.trim()}
            onClick={handleDeleteWorkspace}
          />
        ]}
      >
        <Typography size="body" weight="bold">
          {workspace?.name}
        </Typography>
        <Typography size="body">
          {t("This action is permanent and cannot be reversed.")}
        </Typography>
        <Typography size="body">
          {t(
            "This will permanently delete the workspace and all related projects, assets and datasets for all team members."
          )}
        </Typography>
        <Typography size="body">
          {t("Please type your workspace name to continue.")}
        </Typography>
        <TextInput
          placeholder={t("your workspace name")}
          onChange={setWorkspaceNameConfirm}
        />
      </ModalPanel>
    </Modal>
  );
};

export default DeleteWorkspaceModal;

const CancelButton = styled(Button)(() => ({
  whiteSpace: css.whiteSpace.nowrap
}));
