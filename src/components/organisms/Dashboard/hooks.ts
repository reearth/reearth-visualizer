import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "@reearth/components/molecules/Common/Header";
import type { Project, Team } from "@reearth/components/molecules/Dashboard";
import {
  useGetMeQuery,
  useGetProjectsQuery,
  useCreateTeamMutation,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  Visualizer,
  GetProjectsQuery,
} from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useTeam, useProject, useUnselectProject, useNotification } from "@reearth/state";

export type ProjectNodes = NonNullable<GetProjectsQuery["projects"]["nodes"][number]>[];

const projectsPerPage = 9;

export default (teamId?: string) => {
  const [currentTeam, setCurrentTeam] = useTeam();
  const [currentProject] = useProject();
  const unselectProject = useUnselectProject();
  const [, setNotification] = useNotification();

  const { data, refetch } = useGetMeQuery();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);
  const t = useT();
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
  const gqlCache = useApolloClient().cache;

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
        refetchQueries: ["GetTeams"],
      });
      if (results.data?.createTeam) {
        setNotification({
          type: "success",
          text: t("Successfully created workspace!"),
        });
        setCurrentTeam(results.data.createTeam.team);
        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
      refetch();
    },
    [createTeamMutation, setCurrentTeam, refetch, navigate, t, setNotification],
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

  const {
    data: projectData,
    loading,
    fetchMore,
    networkStatus,
  } = useGetProjectsQuery({
    variables: { teamId: teamId ?? "", last: projectsPerPage },
    skip: !teamId,
    notifyOnNetworkStatusChange: true,
  });

  const projectNodes = projectData?.projects.edges.map(e => e.node) as ProjectNodes;

  const projects = useMemo(() => {
    return (projectNodes ?? [])
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
  }, [projectNodes]);

  const hasMoreProjects =
    projectData?.projects.pageInfo?.hasNextPage || projectData?.projects.pageInfo?.hasPreviousPage;

  const isRefetchingProjects = networkStatus === 3;

  const handleGetMoreProjects = useCallback(() => {
    if (hasMoreProjects) {
      fetchMore({
        variables: {
          before: projectData?.projects.pageInfo?.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [projectData?.projects.pageInfo, fetchMore, hasMoreProjects]);

  const [createNewProject] = useCreateProjectMutation();
  const [createScene] = useCreateSceneMutation({ refetchQueries: ["GetProjects"] });
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
          text: t("Failed to create project."),
        });
        setModalShown(false);
        return;
      } else {
        const scene = await createScene({
          variables: { projectId: project.data.createProject.project.id },
        });
        if (scene.errors) {
          setNotification({
            type: "error",
            text: t("Failed to create project."),
          });
          setModalShown(false);
          return;
        }
        setNotification({
          type: "success",
          text: t("Successfully created project!"),
        });
        setModalShown(false);
      }
    },
    [createNewProject, createScene, teamId, refetch, t, setNotification],
  );

  const [assetModalOpened, setOpenAssets] = useState(false);
  const [selectedAsset, selectAsset] = useState<string | undefined>(undefined);

  const toggleAssetModal = useCallback(
    (b?: boolean) => {
      if (!b) {
        setOpenAssets(!assetModalOpened);
      } else {
        setOpenAssets(b);
      }
    },
    [assetModalOpened, setOpenAssets],
  );

  const onAssetSelect = useCallback((asset?: string) => {
    selectAsset(asset);
  }, []);

  useEffect(() => {
    gqlCache.evict({ fieldName: "projects" });
  }, [gqlCache]);

  return {
    user,
    projects,
    projectLoading: loading ?? isRefetchingProjects,
    hasMoreProjects,
    createProject,
    teams,
    currentTeam: team as Team,
    createTeam,
    changeTeam,
    modalShown,
    openModal,
    handleModalClose,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
    handleGetMoreProjects,
  };
};
