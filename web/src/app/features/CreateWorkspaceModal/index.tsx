import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import {
  useWorkspaceMutations,
  useWorkspaces
} from "@reearth/services/api/workspace";
import { useT } from "@reearth/services/i18n/hooks";
import { useAddWorkspaceModal } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

const WORKSPACE_ALIAS_PATTERN = /^[a-z0-9][a-z0-9-]{3,30}[a-z0-9]$/;
const WORKSPACE_ALIAS_MAX_LENGTH = 32;

const isValidWorkspaceAlias = (alias: string) =>
  WORKSPACE_ALIAS_PATTERN.test(alias) && !alias.includes("--");

const toWorkspaceAlias = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, WORKSPACE_ALIAS_MAX_LENGTH)
    .replace(/-+$/, "");

const AddWorkspaceModal: FC = () => {
  const t = useT();
  const theme = useTheme();

  const navigate = useNavigate();
  const [addWorkspaceModal, setAddWorkspaceModal] = useAddWorkspaceModal();
  const { createWorkspace } = useWorkspaceMutations();

  const [workspaceNameConfirm, setWorkspaceNameConfirm] = useState<string>("");
  const [workspaceAlias, setWorkspaceAlias] = useState<string>("");
  const [aliasEdited, setAliasEdited] = useState(false);
  const [aliasServerError, setAliasServerError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = useCallback(
    (name: string) => {
      setWorkspaceNameConfirm(name);
      if (!aliasEdited) {
        setWorkspaceAlias(toWorkspaceAlias(name));
        setAliasServerError("");
      }
    },
    [aliasEdited]
  );

  const handleAliasChange = useCallback((alias: string) => {
    setWorkspaceAlias(alias.toLowerCase());
    setAliasEdited(true);
    setAliasServerError("");
  }, []);

  const isAliasValid = useMemo(
    () => isValidWorkspaceAlias(workspaceAlias),
    [workspaceAlias]
  );

  const handleCloseAddworkspaceModal = useCallback(() => {
    setAddWorkspaceModal(false);
  }, [setAddWorkspaceModal]);

  const handleAddWorkspace = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const { data, status, aliasError } = await createWorkspace({
        name: workspaceNameConfirm.trim(),
        alias: workspaceAlias
      });
      if (status === "error") {
        if (aliasError) setAliasServerError(aliasError);
        return;
      }
      setAddWorkspaceModal(false);
      navigate(`/dashboard/${data?.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    createWorkspace,
    workspaceNameConfirm,
    workspaceAlias,
    setAddWorkspaceModal,
    navigate
  ]);

  const { workspaces } = useWorkspaces();
  const isDuplicatedName: boolean | undefined = useMemo(() => {
    const name = workspaceNameConfirm.trim();
    if (!name) return false;
    const allWorkspaceNames = workspaces?.map((workspace) => workspace.name);
    return allWorkspaceNames?.includes(name);
  }, [workspaceNameConfirm, workspaces]);

  const canCreate =
    !!workspaceNameConfirm.trim() &&
    !isDuplicatedName &&
    isAliasValid &&
    !isSubmitting;

  useEffect(() => {
    if (!addWorkspaceModal) {
      setWorkspaceNameConfirm("");
      setWorkspaceAlias("");
      setAliasEdited(false);
      setAliasServerError("");
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
            disabled={!canCreate}
            onClick={handleAddWorkspace}
            data-testid="addworkspace-create-btn"
          />
        ]}
        data-testid="addworkspace-modal-panel"
      >
        <ModalContentWrapper data-testid="addworkspace-modal-content">
          <Typography size="body" data-testid="addworkspace-title">
            {t("Your workspace name*")}
          </Typography>
          <TextInput
            value={workspaceNameConfirm}
            placeholder={t("your workspace name")}
            onChange={handleNameChange}
            dataTestid="addworkspace-name-input"
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

          <Typography size="body" data-testid="addworkspace-alias-title">
            {t("Workspace alias*")}
          </Typography>
          <TextInput
            value={workspaceAlias}
            placeholder={t("your-workspace-alias")}
            maxLength={WORKSPACE_ALIAS_MAX_LENGTH}
            onChange={handleAliasChange}
            dataTestid="addworkspace-alias-input"
          />
          {aliasServerError ? (
            <Typography
              size="footnote"
              color={theme.dangerous.main}
              data-testid="addworkspace-alias-error"
            >
              {aliasServerError}
            </Typography>
          ) : workspaceAlias && !isAliasValid ? (
            <Typography
              size="footnote"
              color={theme.dangerous.main}
              data-testid="addworkspace-alias-error"
            >
              {t(
                "Use 5-32 lowercase letters, numbers, or single hyphens, starting and ending with a letter or number."
              )}
            </Typography>
          ) : (
            <Typography size="footnote" color={theme.content.weak}>
              {t("Used in workspace URLs and must be unique.")}
            </Typography>
          )}
        </ModalContentWrapper>
      </ModalPanel>
    </Modal>
  );
};

export default AddWorkspaceModal;

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  justifyContent: "start",
  gap: theme.spacing.normal
}));

const WarningContentWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  maxWidth: "100%",
  marginTop: theme.spacing.small
}));

const WarningTextMessage = styled(Typography)(() => ({
  maxWidth: "calc(100% - 24px)"
}));
