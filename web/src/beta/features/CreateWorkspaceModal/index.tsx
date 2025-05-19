import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useWorkspaceFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useAddWorkspaceModal } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddWorkspaceModal: FC = () => {
  const t = useT();
  const theme = useTheme();

  const navigate = useNavigate();
  const [addWorkspaceModal, setAddWorkspaceModal] = useAddWorkspaceModal();
  const { useCreateWorkspace: addWorkspace, useWorkspacesQuery } =
    useWorkspaceFetcher();

  const [workspaceNameConfirm, setWorkspaceNameConfirm] = useState<string>("");

  const handleCloseAddworkspaceModal = useCallback(() => {
    setAddWorkspaceModal(false);
  }, [setAddWorkspaceModal]);

  const handleAddWorkspace = useCallback(async () => {
    const { data } = await addWorkspace({
      name: workspaceNameConfirm
    });
    setAddWorkspaceModal(false);
    navigate(`/dashboard/${data?.id}`);
  }, [addWorkspace, workspaceNameConfirm, setAddWorkspaceModal, navigate]);

  const { workspaces } = useWorkspacesQuery();
  const isDuplicatedName: boolean | undefined = useMemo(() => {
    const name = workspaceNameConfirm.trim();
    if (!name) return false;
    const allWorkspaceNames = workspaces?.map((workspace) => workspace.name);
    return allWorkspaceNames?.includes(name);
  }, [workspaceNameConfirm, workspaces]);

  useEffect(() => {
    if (!addWorkspaceModal) {
      setWorkspaceNameConfirm("");
    }
  }, [addWorkspaceModal]);

  return (
    <Modal
      visible={addWorkspaceModal}
      size="small"
      data-testid="addworkspace-modal"
    >
      <ModalPanel
        title={t("Create new workspace")}
        layout="common"
        onCancel={handleCloseAddworkspaceModal}
        actions={[
          <Button
            key="cancel"
            title={t("Cancel")}
            appearance="secondary"
            onClick={handleCloseAddworkspaceModal}
            data-testid="addworkspace-cancel-btn"
          />,
          <Button
            key="create"
            title={t("create")}
            appearance="primary"
            disabled={isDuplicatedName}
            onClick={handleAddWorkspace}
            data-testid="addworkspace-create-btn"
          />
        ]}
        data-testid="addworkspace-modal-panel"
      >
        <ModalContentWrapper data-testid="addworkspace-modal-content">
          <Typography size="body" data-testid="addworkspace-title">
            {t("Your workspace Name*")}
          </Typography>
          <TextInput
            placeholder={t("your workspace name")}
            onChange={setWorkspaceNameConfirm}
            data-testid="addworkspace-name-input"
          />

          {isDuplicatedName && (
            <WarningContentWrapper data-testid="addworkspace-warning">
              <Icon icon="lightBulb" color={theme.warning.main} size="normal" />
              <WarningTextMessage size="body" color={theme.warning.main}>
                {t(
                  "The name is already in use by another workspace. Please choose a different name."
                )}
              </WarningTextMessage>
            </WarningContentWrapper>
          )}
        </ModalContentWrapper>
      </ModalPanel>
    </Modal>
  );
};

export default AddWorkspaceModal;

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "start",
  gap: theme.spacing.normal
}));

const WarningContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  maxWidth: "100%",
  marginTop: theme.spacing.small
}));

const WarningTextMessage = styled(Typography)(() => ({
  maxWidth: "calc(100% - 24px)"
}));
