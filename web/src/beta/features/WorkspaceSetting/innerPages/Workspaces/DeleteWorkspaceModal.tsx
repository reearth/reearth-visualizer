import {
  Button,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useWorkspaceFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, Workspace } from "@reearth/services/state";
import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const { useDeleteWorkspace: deleteWorkspace } = useWorkspaceFetcher();

  const [workspaceNameConfirm, setWorkspaceNameConfirm] = useState<string>("");

  const handleDeleteWorkspace = useCallback(async () => {
    if (!workspace?.id) return;
    await deleteWorkspace({ teamId: workspace.id });
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
          <Button
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
          placeholder="your workspace name"
          onChange={setWorkspaceNameConfirm}
        />
      </ModalPanel>
    </Modal>
  );
};

export default DeleteWorkspaceModal;
