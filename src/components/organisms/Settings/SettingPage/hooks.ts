import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { User } from "@reearth/components/molecules/Common/Header";
import {
  useGetMeQuery,
  useGetProjectSceneQuery,
  useGetTeamsQuery,
  useGetProjectWithSceneIdQuery,
  useCreateTeamMutation,
} from "@reearth/gql";
import { useWorkspace, useProject } from "@reearth/state";

type Params = {
  workspaceId?: string;
  projectId?: string;
};

export default (params: Params) => {
  const projectId = params.projectId;

  const [currentWorkspace, setWorkspace] = useWorkspace();
  const [currentProject, setProject] = useProject();

  const { refetch } = useGetMeQuery();

  const navigate = useNavigate();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
      navigate(`/settings/workspaces/${currentWorkspace?.id}`);
    },
    [navigate, refetch, currentWorkspace?.id],
  );

  const { data: sceneData } = useGetProjectSceneQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });
  const sceneId = sceneData?.scene?.id;
  const workspaceId = params.workspaceId ?? sceneData?.scene?.teamId;

  const { data: teamsData } = useGetTeamsQuery();
  const user: User = {
    name: teamsData?.me?.name ?? "",
  };
  const workspaces = teamsData?.me?.teams;

  useEffect(() => {
    if (!currentWorkspace) {
      setWorkspace(
        workspaceId
          ? workspaces?.find(t => t.id === workspaceId)
          : teamsData?.me?.myTeam ?? undefined,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, setWorkspace, workspaces, teamsData?.me]);

  const { data } = useGetProjectWithSceneIdQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });
  const project = data?.node?.__typename === "Project" ? data.node : undefined;

  useEffect(() => {
    setProject(p =>
      p?.id !== project?.id
        ? project
          ? {
              id: project.id,
              name: project.name,
              isArchived: project.isArchived,
              sceneId: project.scene?.id,
            }
          : undefined
        : p,
    );
  }, [project, setProject]);

  const handleWorkspaceChange = useCallback(
    (workspaceId: string) => {
      const workspace = workspaces?.find(workspace => workspace.id === workspaceId);

      if (workspace) {
        setWorkspace(workspace);

        if (params.projectId) {
          navigate("/settings/account");
        }
      }
    },
    [workspaces, setWorkspace, params.projectId, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      const workspace = results.data?.createTeam?.team;
      if (results) {
        setWorkspace(workspace);
      }
    },
    [createTeamMutation, setWorkspace],
  );

  return {
    user,
    workspaces,
    currentWorkspace,
    currentProject,
    sceneId,
    modalShown,
    handleWorkspaceCreate,
    handleWorkspaceChange,
    openModal,
    handleModalClose,
  };
};
