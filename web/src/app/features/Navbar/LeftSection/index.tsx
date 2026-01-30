import {
  Icon,
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { useProjectImportExportMutations } from "@reearth/services/api/project";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { brandRed } from "@reearth/services/theme/reearthTheme/common/colors";
import { useCallback, useMemo } from "react";
import { Link } from "react-router";

import { Project, Workspace } from "../types";

import Profile from "./Profile";

type Props = {
  currentProject?: Project;
  currentWorkspace?: Workspace;
  workspaces?: Workspace[];
  sceneId?: string;
  page: "editor" | "settings" | "projectSettings";
  onSignOut: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
};

const LeftSection: React.FC<Props> = ({
  currentProject,
  currentWorkspace,
  workspaces,
  sceneId,
  page,
  onSignOut,
  onWorkspaceChange
}) => {
  const t = useT();

  const { exportProject } = useProjectImportExportMutations();

  const handleExportProject = useCallback(async () => {
    if (!currentProject?.id) return;

    await exportProject(currentProject.id);
  }, [exportProject, currentProject?.id]);

  const menuItems: PopupMenuItem[] = useMemo(
    () => [
      {
        icon: "setting",
        id: "setting",
        title: t("Settings"),
        path: currentProject?.id
          ? `/settings/projects/${currentProject.id}`
          : ""
      },
      {
        id: "assets",
        title: t("Assets"),
        icon: "file" as const,
        path: currentProject?.id
          ? `/settings/projects/${currentProject.id}/assets`
          : ""
      },
      {
        icon: "plugin",
        id: "plugin",
        title: t("Plugin"),
        path: currentProject?.id
          ? `/settings/projects/${currentProject.id}/plugins`
          : ""
      },
      {
        icon: "downloadSimple",
        id: "export",
        title: t("Export"),
        tileComponent: <Tooltip type="experimental" />,
        onClick: handleExportProject
      }
    ],
    [currentProject?.id, t, handleExportProject]
  );

  return (
    <Wrapper>
      <Icon icon="logo" color={brandRed.dynamicRed} size={30} />
      <StyledLink
        to={`/dashboard/${currentWorkspace?.id}`}
        disabled={!currentWorkspace?.id}
      >
        <IconButton
          icon="grid"
          appearance="simple"
          size="large"
          tooltipText={t("Dashboard")}
        />
      </StyledLink>
      {page === "projectSettings" && (
        <StyledLink to={`/scene/${sceneId}/map`} disabled={!sceneId}>
          <IconButton
            icon="editor"
            appearance="simple"
            size="large"
            tooltipText={t("Editor")}
          />
        </StyledLink>
      )}
      <Profile
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSignOut={onSignOut}
        onWorkspaceChange={onWorkspaceChange}
      />
      <Separator>/</Separator>
      {currentProject && (
        <PopupMenu label={currentProject.name} menu={menuItems} />
      )}
    </Wrapper>
  );
};
export default LeftSection;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.row,
  alignItems: css.alignItems.center,
  height: 32,
  gap: theme.spacing.small
}));

const StyledLink = styled(Link)<{ disabled?: boolean }>(
  ({ theme, disabled }) => ({
    display: css.display.flex,
    color: theme.content.main,
    textDecoration: css.textDecoration.none,
    pointerEvents: disabled ? "none" : "all",
    "&:hover": {
      textDecoration: css.textDecoration.none
    }
  })
);

const Separator = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  margin: `0 ${theme.spacing.smallest}px`,
  userSelect: css.userSelect.none
}));
