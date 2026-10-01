import { useProject, useProjects } from "@reearth/services/api/project";
import { useMe, useMeMutations } from "@reearth/services/api/user";
import { useWorkspaces, useWorkspace } from "@reearth/services/api/workspace";
import { useAuth } from "@reearth/services/auth/useAuth";
import { ProjectSortField, SortDirection } from "@reearth/services/gql";
import {
  useCreateProjectModal,
  useProjectId,
  useWorkspace as useWorkspaceState
} from "@reearth/services/state";
import { ProjectType } from "@reearth/types";
import { useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";

const MAX_PROJECTS_PAGINATION = 100;

export default ({
  projectId,
  workspaceId
}: {
  projectId?: string;
  workspaceId?: string;
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { me: data } = useMe();

  const { logoutFromAccount } = useMeMutations();
  const handleLogout = useCallback(async () => {
    await logoutFromAccount();
    logout();
  }, [logoutFromAccount, logout]);

  const [currentWorkspace, setCurrentWorkspace] = useWorkspaceState();
  const [projectCreatorVisible, setCreateProjectModal] =
    useCreateProjectModal();

  const showProjectCreator = useCallback(() => {
    setCreateProjectModal(true);
  }, [setCreateProjectModal]);

  const { workspaces } = useWorkspaces();
  const { workspace } = useWorkspace(workspaceId);

  const { project } = useProject(projectId);
  const [, setCurrentProjectId] = useProjectId();

  const { projects } = useProjects({
    workspaceId: workspaceId ?? "",
    pagination: { first: MAX_PROJECTS_PAGINATION },
    sort: {
      field: ProjectSortField.Updatedat,
      direction: SortDirection.Desc
    }
  });

  useEffect(() => {
    if (project) {
      setCurrentProjectId(project.id);
    }
  }, [project, setCurrentProjectId]);

  useEffect(() => {
    if (
      !currentWorkspace ||
      (workspace && workspace.id !== currentWorkspace?.id)
    ) {
      if (workspace) {
        setCurrentWorkspace(workspace);
      } else {
        setCurrentWorkspace(
          workspaces?.find((workspace) => workspace.personal)
        );
      }
    }
  }, [currentWorkspace, setCurrentWorkspace, workspace, workspaces]);

  const currentProject:
    | {
        id: string;
        name: string;
        sceneId?: string;
        projectType: ProjectType;
      }
    | undefined = useMemo(
    () =>
      project
        ? {
            id: project.id,
            name: project.name,
            sceneId: project.scene?.id,
            projectType: "beta"
          }
        : undefined,
    [project]
  );

  const handleWorkspaceChange = useCallback(
    (id: string) => {
      const newWorkspace = workspaces?.find((team) => team.id === id);
      if (newWorkspace && workspaceId !== newWorkspace.id) {
        setCurrentWorkspace(newWorkspace);
        navigate(`/dashboard/${newWorkspace.id}`);
      }
    },
    [workspaces, workspaceId, setCurrentWorkspace, navigate]
  );

  return {
    workspaces,
    projects,
    currentProject,
    currentWorkspace,
    userInfo: data,
    projectCreatorVisible,
    handleWorkspaceChange,
    handleLogout,
    showProjectCreator
  };
};
