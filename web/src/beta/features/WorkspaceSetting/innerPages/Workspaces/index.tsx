import { Collapse, Typography, Button } from "@reearth/beta/lib/reearth-ui";
import { InputField } from "@reearth/beta/ui/fields";
import { useProjectFetcher, useWorkspaceFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, type Workspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import DeleteWorkspaceModal from "./DeleteWorkspaceModal";
import DeleteWorkspaceWarningModal from "./DeleteWorkspaceWarningModal";

type Props = {
  workspace: Workspace | undefined;
};

const WorkspaceSetting: FC<Props> = ({ workspace }) => {
  const t = useT();

  const [localWorkspaceName, setLocalWorkspaceName] = useState<string>(
    workspace?.name ?? ""
  );

  const { useUpdateWorkspace: updateWorkspace } = useWorkspaceFetcher();
  const handleSubmitUpdateWorkspaceName = useCallback(async () => {
    await updateWorkspace({
      teamId: workspace?.id ?? "",
      name: localWorkspaceName
    });
  }, [workspace, localWorkspaceName, updateWorkspace]);

  const { useProjectsQuery } = useProjectFetcher();
  const { projects } = useProjectsQuery({
    teamId: workspace?.id ?? "",
    pagination: { first: 1 } // we only need to check where there are projects or not
  });
  const hasProject = useMemo(
    () => !!(projects && projects.length > 0),
    [projects]
  );

  const [deleteWorkspaceModal, setDeleteWorkspaceModal] =
    useState<boolean>(false);

  const [currentWorkspace, setWorkspace] = useWorkspace();
  useEffect(() => {
    if (
      workspace &&
      currentWorkspace &&
      workspace.id === currentWorkspace.id &&
      workspace.name !== currentWorkspace.name
    ) {
      setWorkspace(workspace);
    }
  }, [workspace, currentWorkspace, setWorkspace]);

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse size="large" title={t("Workspace")}>
          <SettingsFields>
            <InputField
              title={t("Workspace Name")}
              value={localWorkspaceName}
              onChange={setLocalWorkspaceName}
              appearance={workspace?.personal ? "readonly" : undefined}
              disabled={!!workspace?.personal}
            />
            <ButtonWrapper>
              <Button
                title={t("Submit")}
                appearance="primary"
                disabled={!!workspace?.personal}
                onClick={handleSubmitUpdateWorkspaceName}
              />
            </ButtonWrapper>
          </SettingsFields>
        </Collapse>
        {!workspace?.personal && (
          <Collapse size="large" title={t("Danger Zone")}>
            <SettingsFields>
              <DangerItem>
                <Typography size="body" weight="bold">
                  {t("Delete workspace")}
                </Typography>
                <Typography size="body">
                  {t("This process will delete this workspace")}
                </Typography>
                <ButtonWrapper>
                  <Button
                    title={t("Delete workspace")}
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

      <DeleteWorkspaceModal
        workspace={workspace}
        visible={deleteWorkspaceModal && !hasProject}
        onClose={() => {
          setDeleteWorkspaceModal(false);
        }}
      />

      <DeleteWorkspaceWarningModal
        visible={deleteWorkspaceModal && hasProject}
        onClose={() => {
          setDeleteWorkspaceModal(false);
        }}
      />
    </InnerPage>
  );
};

const DangerItem = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  background: theme.bg[1],
  gap: theme.spacing.small
}));

const InnerPage = styled("div")<{
  wide?: boolean;
  transparent?: boolean;
}>(({ wide, transparent, theme }) => ({
  boxSizing: "border-box",
  display: "flex",
  width: "100%",
  maxWidth: wide ? 950 : 750,
  backgroundColor: transparent ? "none" : theme.bg[1],
  borderRadius: theme.radius.normal
}));

const SettingsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  flex: 1,
  ["> div:not(:last-child)"]: {
    borderBottom: `1px solid ${theme.outline.weaker}`
  }
}));

const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest
}));

export default WorkspaceSetting;
