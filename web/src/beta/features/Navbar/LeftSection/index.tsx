import {
  IconButton,
  PopupMenu,
  PopupMenuItem,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { useMemo } from "react";
import { Link } from "react-router-dom";

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
  const theme = useTheme();

  const menuItems: PopupMenuItem[] = useMemo(
    () => [
      {
        icon: "setting",
        id: "setting",
        title: t("Project settings"),
        path: currentProject?.id ? `/settings/project/${currentProject.id}` : ""
      },
      {
        icon: "plugin",
        id: "plugin",
        title: t("Plugin"),
        path: currentProject?.id
          ? `/settings/project/${currentProject.id}/plugins`
          : ""
      }
    ],
    [currentProject?.id, t]
  );

  return (
    <Wrapper>
      {page !== "editor" && (
        <StyledLink to={`/`}>
          <Typography size="body" weight="bold" color={theme.dangerous.strong}>
            {t("Visualizer")}
          </Typography>
        </StyledLink>
      )}
      <StyledLink
        to={`/dashboard/${currentWorkspace?.id}`}
        disabled={!currentWorkspace?.id}
      >
        <IconButton icon="grid" appearance="simple" size="large" />
      </StyledLink>
      {page === "projectSettings" && (
        <StyledLink to={`/scene/${sceneId}/map`} disabled={!sceneId}>
          <IconButton icon="editor" appearance="simple" size="large" />
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
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  height: 32,
  gap: theme.spacing.small
}));

const StyledLink = styled(Link)<{ disabled?: boolean }>(
  ({ theme, disabled }) => ({
    display: "flex",
    color: theme.content.main,
    textDecoration: "none",
    pointerEvents: disabled ? "none" : "all",
    "&:hover": {
      textDecoration: "none"
    }
  })
);

const Separator = styled.div(({ theme }) => ({
  color: theme.content.weak,
  margin: `0 ${theme.spacing.smallest}px`,
  userSelect: "none"
}));
