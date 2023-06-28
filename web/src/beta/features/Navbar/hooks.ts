import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth/services/auth";
import {
  useCreateTeamMutation,
  useGetProjectBySceneQuery,
  useGetTeamsQuery,
} from "@reearth/services/gql";
import { useProject, useWorkspace } from "@reearth/services/state";

type User = {
  name: string;
};

export default (sceneId: string) => {
  const { logout: handleLogout } = useAuth();

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [currentProject, setProject] = useProject();

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);

  const { data: workspaceData } = useGetTeamsQuery();
  const navigate = useNavigate();
  const workspaces = useMemo(() => {
    return workspaceData?.me?.teams?.map(({ id, name }) => ({ id, name }));
  }, [workspaceData?.me?.teams]);

  const { data } = useGetProjectBySceneQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const workspaceId = useMemo(() => {
    return data?.node?.__typename === "Scene" ? data.node.teamId : undefined;
  }, [data?.node]);

  const project = useMemo(
    () =>
      data?.node?.__typename === "Scene" && data.node.project
        ? { ...data.node.project, sceneId: data.node.id }
        : undefined,
    [data?.node],
  );

  const user: User = useMemo(() => {
    return {
      name: workspaceData?.me?.name || "",
    };
  }, [workspaceData?.me]);

  const personal = useMemo(() => {
    return workspaceId === workspaceData?.me?.myTeam.id;
  }, [workspaceId, workspaceData?.me]);

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalVisible(true), []);
  const handleWorkspaceModalClose = useCallback(() => setWorkspaceModalVisible(false), []);

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
        setCurrentWorkspace(workspace);

        navigate(`/dashboard/${workspaceId}`);
      }
    },
    [workspaces, currentWorkspace, setCurrentWorkspace, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();

  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      if (results.data?.createTeam) {
        setCurrentWorkspace(results.data.createTeam.team);

        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
    },
    [createTeamMutation, setCurrentWorkspace, navigate],
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
