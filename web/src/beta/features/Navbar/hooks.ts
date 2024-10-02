import { useWorkspaceFetcher, useProjectFetcher } from "@reearth/services/api";
import { useAuth } from "@reearth/services/auth";
import { useWorkspace } from "@reearth/services/state";
import { ProjectType } from "@reearth/types";
import { useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default ({
  projectId,
  workspaceId
}: {
  projectId?: string;
  workspaceId?: string;
}) => {
  const navigate = useNavigate();
  const { logout: handleLogout } = useAuth();

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const { useProjectQuery } = useProjectFetcher();
  const { useWorkspaceQuery, useWorkspacesQuery } = useWorkspaceFetcher();

  const { workspaces } = useWorkspacesQuery();
  const { workspace } = useWorkspaceQuery(workspaceId);

  const { project } = useProjectQuery(projectId);

  useEffect(() => {
    if (
      !currentWorkspace ||
      (workspace && workspace.id !== currentWorkspace?.id)
    ) {
      setCurrentWorkspace(workspace);
    }
  }, [currentWorkspace, setCurrentWorkspace, workspace]);

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
    currentProject,
    currentWorkspace,
    handleWorkspaceChange,
    handleLogout
  };
};
