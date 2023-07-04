import { useApolloClient } from "@apollo/client";
import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth/services/auth";
import { useCreateWorkspaceMutation, GetMeQuery, GetProjectQuery } from "@reearth/services/gql";
import { GET_PROJECT } from "@reearth/services/gql/queries/project";
import { GET_ME } from "@reearth/services/gql/queries/user";
import { useProject, useWorkspace } from "@reearth/services/state";

export default ({ projectId, workspaceId }: { projectId?: string; workspaceId?: string }) => {
  const gqlClient = useApolloClient();

  const navigate = useNavigate();
  const { logout: handleLogout } = useAuth();

  const [_, setCurrentWorkspace] = useWorkspace(); // todo: remove when we don't rely on jotai anymore
  const [currentProject, setProject] = useProject(); // todo: remove when we don't rely on jotai anymore

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);

  const workspaceData: GetMeQuery | null = gqlClient.readQuery({ query: GET_ME }); // todo: use custom readQuery from other PR

  const workspaces = useMemo(
    () => workspaceData?.me?.teams?.map(({ id, name }) => ({ id, name })),
    [workspaceData?.me?.teams],
  );

  const projectData: GetProjectQuery | null = gqlClient.readQuery({
    query: GET_PROJECT,
    variables: { projectId },
  }); // todo: use custom readQuery from other PR

  const project = useMemo(
    () =>
      projectData?.node?.__typename === "Project"
        ? { ...projectData.node, sceneId: projectData.node.scene?.id }
        : undefined,
    [projectData?.node],
  );

  const workspace = useMemo(
    () => workspaces?.find(w => w.id === workspaceId),
    [workspaces, workspaceId],
  );

  const username = useMemo(() => workspaceData?.me?.name || "", [workspaceData?.me]);

  const personal = useMemo(
    () => workspaceId === workspaceData?.me?.myTeam.id,
    [workspaceId, workspaceData?.me],
  );

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
    (id: string) => {
      const workspace = workspaces?.find(team => team.id === workspaceId);
      if (workspace && workspaceId !== id) {
        setCurrentWorkspace(workspace);
        navigate(`/dashboard/${workspaceId}`);
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
    username,
    workspace,
    workspaceModalVisible,
    handleWorkspaceModalOpen,
    handleWorkspaceModalClose,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    handleLogout,
  };
};
