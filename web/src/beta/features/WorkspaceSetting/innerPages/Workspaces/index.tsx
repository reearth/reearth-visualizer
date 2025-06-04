import { Typography, Button } from "@reearth/beta/lib/reearth-ui";
import { InputField } from "@reearth/beta/ui/fields";
import {
  useMeFetcher,
  useProjectFetcher,
  useWorkspaceFetcher
} from "@reearth/services/api";
import { Role } from "@reearth/services/gql";
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

  const { useUpdateWorkspace: updateWorkspace } = useWorkspaceFetcher();

  const handleSubmitUpdateWorkspaceName = useCallback(
    async (name: string) => {
      await updateWorkspace({
        teamId: workspace?.id ?? "",
        name
      });
    },
    [workspace, updateWorkspace]
  );

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

  const { me } = useMeFetcher().useMeQuery();
  const meId = me?.id;
  const meRole = useMemo(
    () => workspace?.members?.find((m) => m.userId === meId)?.role,
    [workspace, meId]
  );

  return (
    <InnerPage wide>
      <SettingsWrapper>
        <SettingsFields>
          <TitleWrapper size="body" weight="bold">
            {t("Workspace")}
          </TitleWrapper>
          <InputField
            title={t("Workspace Name")}
            value={workspace?.name}
            appearance={workspace?.personal ? "readonly" : undefined}
            disabled={!!workspace?.personal || meRole !== Role.Owner}
            onChangeComplete={handleSubmitUpdateWorkspaceName}
          />
        </SettingsFields>
        {!workspace?.personal && (
          <SettingsFields>
            <TitleWrapper size="body" weight="bold">
              {t("Danger Zone")}
            </TitleWrapper>
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
                  disabled={meRole !== Role.Owner}
                />
              </ButtonWrapper>
            </DangerItem>
          </SettingsFields>
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
  gap: theme.spacing.largest,
  padding: `${theme.spacing.normal}px ${theme.spacing.largest}px ${theme.spacing.largest}px`
}));

const TitleWrapper = styled(Typography)(({ theme }) => ({
  color: theme.content.main
}));

export default WorkspaceSetting;
