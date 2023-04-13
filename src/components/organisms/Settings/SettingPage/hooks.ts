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
  teamId?: string;
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
  const teamId = params.teamId ?? sceneData?.scene?.teamId;

  const { data: teamsData } = useGetTeamsQuery();
  const user: User = {
    name: teamsData?.me?.name ?? "",
  };
  const teams = teamsData?.me?.teams;

  useEffect(() => {
    if (!currentWorkspace) {
      setWorkspace(teamId ? teams?.find(t => t.id === teamId) : teamsData?.me?.myTeam ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, setWorkspace, teams, teamsData?.me]);

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
    (teamId: string) => {
      const team = teams?.find(team => team.id === teamId);

      if (team) {
        setWorkspace(team);

        if (params.projectId) {
          navigate("/settings/account");
        }
      }
    },
    [teams, setWorkspace, params.projectId, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      const team = results.data?.createTeam?.team;
      if (results) {
        setWorkspace(team);
      }
    },
    [createTeamMutation, setWorkspace],
  );

  return {
    user,
    teams,
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
