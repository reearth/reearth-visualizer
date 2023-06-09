import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth/services/auth";
import {
  useCreateTeamMutation,
  useGetProjectBySceneQuery,
  useGetTeamsQuery,
} from "@reearth/services/gql";
import { useProject, useSessionWorkspace, useWorkspace } from "@reearth/services/state";

type User = {
  name: string;
};

export default (sceneId: string) => {
  const { logout: handleLogout } = useAuth();

  const [currentWorkspace, setWorkspace] = useSessionWorkspace();
  const [currentProject, setProject] = useProject();
  const [lastWorkspace, setLastWorkspace] = useWorkspace();

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);

  const { data: workspaceData } = useGetTeamsQuery();
  const navigate = useNavigate();
  const workspaces = workspaceData?.me?.teams;

  const { data } = useGetProjectBySceneQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });
  const workspaceId = data?.node?.__typename === "Scene" ? data.node.teamId : undefined;
  const project = useMemo(
    () =>
      data?.node?.__typename === "Scene" && data.node.project
        ? { ...data.node.project, sceneId: data.node.id }
        : undefined,
    [data?.node],
  );

  const user: User = {
    name: workspaceData?.me?.name || "",
  };

  const personal = workspaceId === workspaceData?.me?.myTeam.id;

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalVisible(true), []);
  const handleWorkspaceModalClose = useCallback(() => setWorkspaceModalVisible(false), []);

  useEffect(() => {
    if (!currentWorkspace && lastWorkspace) setWorkspace(lastWorkspace);
  }, [currentWorkspace, lastWorkspace, setWorkspace]);

  useEffect(() => {
    if (currentWorkspace) return;
    const workspace = workspaces?.find(t => t.id === workspaceId);
    if (!workspace) return;
    setWorkspace(workspace);
    setLastWorkspace(currentWorkspace);
  }, [workspaces, currentWorkspace, setWorkspace, setLastWorkspace, workspaceId]);
  useEffect(() => {
    setProject(p =>
      p?.id !== project?.id
        ? project
          ? {
              id: project.id,
              name: project.name,
              sceneId: project.sceneId,
              projectType: project.coreSupport ? "beta" : "classic",
            }
          : undefined
        : p,
    );
  }, [project, setProject]);
  const handleWorkspaceChange = useCallback(
    (workspaceId: string) => {
      const workspace = workspaces?.find(team => team.id === workspaceId);
      if (workspace && workspaceId !== currentWorkspace?.id) {
        setWorkspace(workspace);
        setLastWorkspace(currentWorkspace);

        navigate(`/dashboard/${workspaceId}`);
      }
    },
    [workspaces, currentWorkspace, setWorkspace, setLastWorkspace, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();

  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      if (results.data?.createTeam) {
        setWorkspace(results.data.createTeam.team);
        setLastWorkspace(results.data.createTeam.team);

        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
    },
    [createTeamMutation, setWorkspace, setLastWorkspace, navigate],
  );

  return {
    workspaces,
    currentProject,
    isPersonal: personal,
    user,
    currentWorkspace,
    workspaceModalVisible,
    handleWorkspaceModalOpen,
    handleWorkspaceModalClose,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    handleLogout,
  };
};
