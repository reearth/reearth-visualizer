import ProductsMenu from "@reearth/app/features/ProductsMenu";
import Profile from "@reearth/app/features/UserProfile";
import useWorkspaceManagementMenu from "@reearth/app/hooks/useWorkspaceManagementMenu";
import {
  Icon,
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { useProjectImportExportMutations } from "@reearth/services/api/project";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { brandRed } from "@reearth/services/theme/reearthTheme/common/colors";
import { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";

import { NavbarProject, CurrentProject, Workspace } from "../types";

type Props = {
  currentProject?: CurrentProject;
  currentWorkspace?: Workspace;
  workspaces?: Workspace[];
  projects?: NavbarProject[];
  sceneId?: string;
  userInfo?: {
    name?: string;
    email?: string;
  };
  page: "editor" | "settings" | "projectSettings";
  onSignOut: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
  showProjectCreator: () => void;
};

const LeftSection: React.FC<Props> = ({
  currentProject,
  currentWorkspace,
  workspaces,
  sceneId,
  userInfo,
  page,
  projects,
  onSignOut,
  onWorkspaceChange,
  showProjectCreator
}) => {
  const t = useT();
  const theme = useTheme();
  const navigate = useNavigate();

  const { exportProject } = useProjectImportExportMutations();
  const { accountMenuItems } = useWorkspaceManagementMenu({
    workspaceId: currentWorkspace?.id,
    workspaceAlias: currentWorkspace?.alias,
    userName: userInfo?.name,
    userEmail: userInfo?.email,
    onSignOut
  });

  const handleExportProject = useCallback(async () => {
    if (!currentProject?.id) return;

    await exportProject(currentProject.id);
  }, [exportProject, currentProject?.id]);

  const handleProjectOpen = useCallback(
    (sceneId?: string) => {
      if (sceneId) {
        navigate(`/scene/${sceneId}/map`);
      }
    },
    [navigate]
  );

  const menuItems: PopupMenuItem[] = useMemo(
    () => [
      {
        id: "project-header",
        isHeader: true,
        title: t("Project"),
        icon: "grid"
      },
      {
        id: "project-name",
        title: currentProject?.name || "",
        subItem: [
          ...(projects?.map((project) => ({
            id: project.id,
            selected: currentProject?.id === project.id,
            title: project.name,
            onClick: () => handleProjectOpen(project.scene?.id || undefined)
          })) ?? []),
          {
            id: "new-project",
            dataTestid: "profile-newProject",
            hasFooter: true,
            title: t("New Project"),
            icon: "plus" as const,
            iconColor: theme.primary.main,
            color: theme.primary.main,
            onClick: () => showProjectCreator()
          }
        ]
      },
      {
        icon: "setting",
        id: "setting",
        title: t("Project Settings"),
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
    [
      t,
      currentProject?.name,
      currentProject?.id,
      projects,
      theme.primary.main,
      handleExportProject,
      handleProjectOpen,
      showProjectCreator
    ]
  );

  return (
    <Wrapper>
      <Icon icon="logo" color={brandRed.dynamicRed} size={30} />
      <PopupMenu
        label={
          <Icon
            icon="caretDown"
            size="small"
            data-testid="profile-caretDownIcon"
          />
        }
        menu={accountMenuItems}
        dataTestid="avatar-popupMenu"
      />
      <ProductsMenu workspaceId={currentWorkspace?.id} />
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
        data-testid="navbar-profile"
        currentUser={currentWorkspace?.name}
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
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
