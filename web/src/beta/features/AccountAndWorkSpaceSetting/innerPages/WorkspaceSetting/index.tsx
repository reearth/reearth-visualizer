import { ApolloError } from "@apollo/client";
import {
  Collapse,
  TextInput,
  Typography,
  Icon,
  Button,
  Modal,
  ModalPanel
} from "@reearth/beta/lib/reearth-ui";
import { InputField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, Workspace } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import { WorkspacePayload } from "../../hooks";
import { InnerPage, SettingsWrapper, SettingsFields } from "../common";

type Props = {
  handleFetchWorkspaces: () => {
    workspaces: Workspace[] | undefined;
    loading: boolean;
    error: ApolloError | undefined;
  };
  handleUpdateWorkspace: ({ teamId, name }: WorkspacePayload) => Promise<void>;
  handleDeleteWorkspace: (teamId: string) => Promise<void>;
  projectsCount?: number;
};

const WorkspaceSetting: FC<Props> = ({
  handleFetchWorkspaces,
  handleUpdateWorkspace,
  handleDeleteWorkspace,
  projectsCount
}) => {
  const t = useT();
  const theme = useTheme();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState<string>(
    currentWorkspace?.name ?? ""
  );
  const [workspaceNameConfirm, setWorkspaceNameConfirm] = useState<string>("");
  const [deleteWorkspaceModal, setDeleteWorkspaceModal] =
    useState<boolean>(false);

  const { workspaces } = handleFetchWorkspaces();
  const personalWorkspace = workspaces?.find((workspace) => workspace.personal);

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse size="large" title={t("Workspace")}>
          <SettingsFields>
            <InputField
              title={t("Workspace Name")}
              value={currentWorkspace?.name ? t(currentWorkspace.name) : ""}
              onChange={setWorkspaceName}
              appearance={currentWorkspace?.personal ? "readonly" : "present"}
              disabled={currentWorkspace?.personal}
            />
            <ButtonWrapper>
              <Button
                title={t("Submit")}
                appearance="primary"
                disabled={currentWorkspace?.personal}
                onClick={() => {
                  if (currentWorkspace?.id) {
                    handleUpdateWorkspace({
                      teamId: currentWorkspace?.id,
                      name: workspaceName
                    });
                    const renamedWorkspace = {
                      ...currentWorkspace,
                      name: workspaceName
                    };
                    setCurrentWorkspace(renamedWorkspace);
                  }
                }}
              />
            </ButtonWrapper>
          </SettingsFields>
        </Collapse>
        {!currentWorkspace?.personal && (
          <Collapse size="large" title={t("Danger Zone")}>
            <SettingsFields>
              <DangerItem>
                <Typography size="body" weight="bold">
                  {t("Remove this workspace")}
                </Typography>
                <Typography size="body">
                  {t("This process will remove this workspace")}
                </Typography>
                <ButtonWrapper>
                  <Button
                    title={t("Remove workspace")}
                    appearance="dangerous"
                    onClick={() => {
                      setDeleteWorkspaceModal(true);
                    }}
                  />
                </ButtonWrapper>
              </DangerItem>
            </SettingsFields>
          </Collapse>
        )}
      </SettingsWrapper>

      <Modal
        visible={
          deleteWorkspaceModal && (!projectsCount || projectsCount === 0)
        }
        size="small"
      >
        <ModalPanel
          title={t("Delete workspace")}
          onCancel={() => {
            setDeleteWorkspaceModal(false);
          }}
          actions={[
            <Button
              key="cancel"
              title={t("Cancel")}
              appearance="secondary"
              onClick={() => {
                setDeleteWorkspaceModal(false);
              }}
            />,
            <Button
              key="delete"
              title={t("I am sure I want to delete this workspace.")}
              appearance="dangerous"
              disabled={
                workspaceNameConfirm.trim() !== currentWorkspace?.name.trim()
              }
              onClick={() => {
                if (currentWorkspace?.id) {
                  handleDeleteWorkspace(currentWorkspace?.id);
                  setCurrentWorkspace(personalWorkspace);
                  setDeleteWorkspaceModal(false);
                  navigate(`/`);
                }
              }}
            />
          ]}
        >
          <ModalContentWrapper>
            <Typography size="body" weight="bold">
              {currentWorkspace?.name}
            </Typography>
            <Typography size="body">
              {t("This action cannot be undone. ")}
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
              onChange={(name) => {
                setWorkspaceNameConfirm(name);
              }}
            />
          </ModalContentWrapper>
        </ModalPanel>
      </Modal>

      <Modal
        visible={deleteWorkspaceModal && !!projectsCount && projectsCount > 0}
        size="small"
      >
        <ModalContentWrapper>
          <Icon icon="warning" size="large" color={theme.warning.main} />
          <Typography size="body">
            {t("You are going to delete a workspace.")}
          </Typography>
          <Typography size="body">
            {t(
              "Please to make sure you don’t have any projects in your workspace, then you can continue."
            )}
          </Typography>
          <ButtonWrapper>
            <Button
              key="ok"
              title={t("Ok")}
              appearance="secondary"
              onClick={() => {
                setDeleteWorkspaceModal(false);
              }}
            />
          </ButtonWrapper>
        </ModalContentWrapper>
      </Modal>
    </InnerPage>
  );
};

const DangerItem = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  background: theme.bg[1],
  borderRadius: theme.radius.large
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  background: theme.bg[1],
  gap: theme.spacing.small
}));
export default WorkspaceSetting;
