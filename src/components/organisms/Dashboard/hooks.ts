import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "@reach/router";
import { useLocalState } from "@reearth/state";
import {
  useMeQuery,
  useCreateTeamMutation,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  Visualizer,
  useCreateAssetMutation,
  AssetsQuery,
  useAssetsQuery,
} from "@reearth/gql";

import { User } from "@reearth/components/molecules/Common/Header";
import { Project } from "@reearth/components/molecules/Dashboard/types";

import { Team } from "@reearth/components/molecules/Dashboard/types";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

export default (teamId?: string) => {
  const [{ error, currentTeam, currentProject }, setLocalState] = useLocalState(s => ({
    error: s.error,
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));
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

  useEffect(() => {
    if (team?.id && team.id !== currentTeam?.id) {
      setLocalState({ currentTeam: team });
    }
  }, [currentTeam, team, setLocalState]);

  const changeTeam = useCallback(
    (teamId: string) => {
      const team = teams?.find(team => team.id === teamId);
      if (team) {
        setLocalState({ currentTeam: team });
        navigate(`/dashboard/${teamId}`);
      }
    },
    [teams, setLocalState, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createTeam = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["teams"],
      });
      if (results.data?.createTeam) {
        setLocalState({ currentTeam: results.data.createTeam.team });
        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
      refetch();
    },
    [createTeamMutation, setLocalState, refetch, navigate],
  );

  const notificationTimeout = 5000;

  const notification = useMemo<{ type: "error"; text: string } | undefined>(() => {
    return error ? { type: "error", text: error } : undefined;
  }, [error]);

  useEffect(() => {
    if (!error) return;
    const timerID = setTimeout(() => {
      setLocalState({ error: undefined });
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [error, setLocalState]);

  const onNotificationClose = useCallback(() => {
    if (error) {
      setLocalState({ error: undefined });
    }
  }, [error, setLocalState]);

  useEffect(() => {
    // unselect project
    if (currentProject) {
      setLocalState({
        currentProject: undefined,
        sceneId: undefined,
        rootLayerId: undefined,
        selectedLayer: undefined,
        selectedWidget: undefined,
        selectedBlock: undefined,
        selectedType: undefined,
        camera: undefined,
        isCapturing: undefined,
      });
    }
  }, [currentProject, setLocalState]);

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  const projects = useMemo(() => {
    return (team?.projects.nodes ?? [])
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
  }, [team?.projects.nodes]);

  const [createNewProject] = useCreateProjectMutation();
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
        throw new Error(intl.formatMessage({ defaultMessage: "Failed to create project." }));
      }
      const scene = await createScene({
        variables: { projectId: project.data.createProject.project.id },
      });
      if (scene.errors || !scene.data?.createScene) {
        throw new Error(intl.formatMessage({ defaultMessage: "Failed to create project." }));
      }
      setModalShown(false);
      refetch();
    },
    [createNewProject, createScene, teamId, refetch, intl],
  );

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (file: File) =>
      (async () => {
        if (teamId) {
          await createAssetMutation({
            variables: { teamId, file },
            refetchQueries: ["Assets"],
          });
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
    notification,
    onNotificationClose,
    modalShown,
    openModal,
    handleModalClose,
    createAssets,
    assets,
  };
};
