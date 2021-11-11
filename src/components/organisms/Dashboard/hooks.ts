import { useNavigate } from "@reach/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import type { User } from "@reearth/components/molecules/Common/Header";
import type { Project, Team } from "@reearth/components/molecules/Dashboard";
import {
  useMeQuery,
  useProjectQuery,
  useCreateTeamMutation,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  Visualizer,
  useCreateAssetMutation,
  AssetsQuery,
  useAssetsQuery,
} from "@reearth/gql";
import { useTeam, useProject, useUnselectProject, useNotification } from "@reearth/state";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

export default (teamId?: string) => {
  const [currentTeam, setCurrentTeam] = useTeam();
  const [currentProject] = useProject();
  const unselectProject = useUnselectProject();
  const [, setNotification] = useNotification();

  const { data, refetch } = useMeQuery();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);
  const intl = useIntl();
  const navigate = useNavigate();

  const toPublishmentStatus = (s: PublishmentStatus) =>
    s === PublishmentStatus.Public
      ? "published"
      : s === PublishmentStatus.Limited
      ? "limited"
      : "unpublished";

  const user: User = {
    name: data?.me?.name || "",
  };

  const teams = data?.me?.teams;
  const team = teams?.find(team => team.id === teamId);
  const personal = teamId === data?.me?.myTeam.id;

  useEffect(() => {
    if (team?.id && team.id !== currentTeam?.id) {
      setCurrentTeam({
        personal,
        ...team,
      });
    }
  }, [currentTeam, team, setCurrentTeam, personal]);

  const changeTeam = useCallback(
    (teamId: string) => {
      const team = teams?.find(team => team.id === teamId);
      if (team) {
        setCurrentTeam(team);
        navigate(`/dashboard/${teamId}`);
      }
    },
    [teams, setCurrentTeam, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createTeam = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["teams"],
      });
      if (results.data?.createTeam) {
        setNotification({
          type: "success",
          text: intl.formatMessage({ defaultMessage: "Successfully created workspace!" }),
        });
        setCurrentTeam(results.data.createTeam.team);
        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
      refetch();
    },
    [createTeamMutation, setCurrentTeam, refetch, navigate, intl, setNotification],
  );

  useEffect(() => {
    // unselect project
    if (currentProject) {
      unselectProject();
    }
  }, [currentProject, setCurrentTeam, unselectProject]);

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  const { data: projectData } = useProjectQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });

  const projects = useMemo(() => {
    return (projectData?.projects.nodes ?? [])
      .map<Project | undefined>(project =>
        project
          ? {
              id: project.id,
              description: project.description,
              name: project.name,
              image: project.imageUrl,
              status: toPublishmentStatus(project.publishmentStatus),
              isArchived: project.isArchived,
              sceneId: project.scene?.id,
            }
          : undefined,
      )
      .filter((project): project is Project => !!project);
  }, [projectData?.projects.nodes]);

  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["Project"],
  });
  const [createScene] = useCreateSceneMutation();
  const createProject = useCallback(
    async (data: { name: string; description: string; imageUrl: string | null }) => {
      if (!teamId) return;
      const project = await createNewProject({
        variables: {
          teamId,
          visualizer: Visualizer.Cesium,
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
        },
      });
      if (project.errors || !project.data?.createProject) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to create project." }),
        });
        setModalShown(false);
        return;
      }
      const scene = await createScene({
        variables: { projectId: project.data.createProject.project.id },
      });
      if (scene.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to create project." }),
        });
        setModalShown(false);
        return;
      }
      setNotification({
        type: "success",
        text: intl.formatMessage({ defaultMessage: "Successfully created project!" }),
      });
      setModalShown(false);
      refetch();
    },
    [createNewProject, createScene, teamId, refetch, intl, setNotification],
  );

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (teamId) {
          await Promise.all(
            Array.from(files).map(file =>
              createAssetMutation({ variables: { teamId, file }, refetchQueries: ["Assets"] }),
            ),
          );
        }
      })(),
    [createAssetMutation, teamId],
  );

  const { data: assetsData } = useAssetsQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });
  const assets = assetsData?.assets.nodes.filter(Boolean) as AssetNodes;

  return {
    user,
    projects,
    createProject,
    teams,
    currentTeam: team as Team,
    createTeam,
    changeTeam,
    modalShown,
    openModal,
    handleModalClose,
    createAssets,
    assets,
  };
};
