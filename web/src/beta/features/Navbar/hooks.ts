import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useWorkspaceFetcher, useMeFetcher, useProjectFetcher } from "@reearth/services/api";
import { useAuth } from "@reearth/services/auth";
import { Workspace, useWorkspace } from "@reearth/services/state";
import { ProjectType } from "@reearth/types";

export default ({ projectId, workspaceId }: { projectId?: string; workspaceId?: string }) => {
  const navigate = useNavigate();
  const { logout: handleLogout } = useAuth();

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace(); // todo: remove when we don't rely on jotai anymore

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);

  const { useProjectQuery } = useProjectFetcher();
  const { useWorkspaceQuery, useWorkspacesQuery, useCreateWorkspace } = useWorkspaceFetcher();
  const { useMeQuery } = useMeFetcher();

  const { workspaces } = useWorkspacesQuery();
  const { workspace } = useWorkspaceQuery(workspaceId);

  const { project } = useProjectQuery(projectId);
  const {
    me: { name, myTeam },
  } = useMeQuery();

  const personal = useMemo(() => workspaceId === myTeam?.id, [workspaceId, myTeam?.id]);

  useEffect(() => {
    if (!currentWorkspace || (workspace && workspace.id !== currentWorkspace?.id)) {
      setCurrentWorkspace(workspace);
    }
  });

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalVisible(true), []);
  const handleWorkspaceModalClose = useCallback(() => setWorkspaceModalVisible(false), []);

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
            projectType: project.coreSupport ? "beta" : "classic",
          }
        : undefined,
    [project],
  );

  const handleWorkspaceChange = useCallback(
    (id: string) => {
      const newWorkspace = workspaces?.find(team => team.id === id);
      if (newWorkspace && workspaceId !== newWorkspace.id) {
        setCurrentWorkspace(newWorkspace);
        navigate(`/dashboard/${newWorkspace.id}`);
      }
    },
    [workspaces, workspaceId, setCurrentWorkspace, navigate],
  );

  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await useCreateWorkspace(data.name);
      const newWorkspace = results.data as Workspace; // Only needed for setting current workspace. Can remove after jotai use ends.

      if (results.status === "success") {
        setCurrentWorkspace(newWorkspace);

        navigate(`/dashboard/${newWorkspace.id}`);
      }
    },
    [useCreateWorkspace, setCurrentWorkspace, navigate],
  );

  return {
    workspaces,
    currentProject,
    isPersonal: personal,
    username: name,
    workspace,
    workspaceModalVisible,
    handleWorkspaceModalOpen,
    handleWorkspaceModalClose,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    handleLogout,
  };
};
