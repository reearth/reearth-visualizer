import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useMeQuery,
  useProjectQuery,
  useWorkspaceQuery,
  useWorkspacesQuery,
} from "@reearth/services/api";
import { useAuth } from "@reearth/services/auth";
import { useCreateWorkspaceMutation } from "@reearth/services/gql";
import { useProject, useWorkspace } from "@reearth/services/state";

export default ({ projectId, workspaceId }: { projectId?: string; workspaceId?: string }) => {
  const navigate = useNavigate();
  const { logout: handleLogout } = useAuth();

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace(); // todo: remove when we don't rely on jotai anymore
  const [currentProject, setProject] = useProject(); // todo: remove when we don't rely on jotai anymore

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);

  const { workspace } = useWorkspaceQuery(workspaceId);
  const { workspaces } = useWorkspacesQuery();
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

  useEffect(() => {
    setProject(p =>
      p?.id !== project?.id
        ? project
          ? {
              id: project.id,
              name: project.name,
              sceneId: project.scene?.id,
              projectType: project.coreSupport ? "beta" : "classic",
            }
          : undefined
        : p,
    );
  }, [project, setProject]);

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

  const [createWorkspaceMutation] = useCreateWorkspaceMutation();

  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createWorkspaceMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      if (results.data?.createTeam) {
        setCurrentWorkspace(results.data.createTeam.team);

        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
    },
    [createWorkspaceMutation, setCurrentWorkspace, navigate],
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
