import { useApolloClient } from "@apollo/client";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Project } from "@reearth/components/molecules/Dashboard/types";
import {
  useGetMeQuery,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  useGetProjectsQuery,
  Visualizer,
  GetProjectsQuery,
} from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useTeam, useProject, useNotification } from "@reearth/state";

const toPublishmentStatus = (s: PublishmentStatus) =>
  s === PublishmentStatus.Public
    ? "published"
    : s === PublishmentStatus.Limited
    ? "limited"
    : "unpublished";

export type ProjectNodes = NonNullable<GetProjectsQuery["projects"]["nodes"][number]>[];

const projectPerPage = 5;

export default (teamId: string) => {
  const [, setNotification] = useNotification();
  const [currentTeam, setTeam] = useTeam();
  const [, setProject] = useProject();
  const navigate = useNavigate();
  const t = useT();
  const gqlCache = useApolloClient().cache;

  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useGetMeQuery();
  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetProjects"],
  });
  const [createScene] = useCreateSceneMutation();

  if (currentTeam && currentTeam.id !== teamId) {
    teamId = currentTeam?.id;
  }
  const team = teamId ? data?.me?.teams.find(team => team.id === teamId) : data?.me?.myTeam;

  const {
    data: projectData,
    loading: loadingProjects,
    fetchMore,
    networkStatus,
  } = useGetProjectsQuery({
    variables: { teamId: teamId ?? "", last: projectPerPage },
    skip: !teamId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (team?.id && !currentTeam?.id) {
      setTeam(team);
    }
  }, [currentTeam, team, setTeam]);

  const projectNodes = projectData?.projects.edges.map(e => e.node) as ProjectNodes;

  const currentProjects = (projectNodes ?? [])
    .map<Project | undefined>(project =>
      project
        ? {
            id: project.id,
            description: project.description,
            name: project.name,
            imageUrl: project.imageUrl,
            isArchived: project.isArchived,
            status: toPublishmentStatus(project.publishmentStatus),
            sceneId: project.scene?.id,
          }
        : undefined,
    )
    .filter((project): project is Project => !!project);

  const totalProjects = projectData?.projects.totalCount;
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

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  // Submit Form
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
      }
      const scene = await createScene({
        variables: { projectId: project.data.createProject.project.id },
      });
      if (scene.errors || !scene.data?.createScene) {
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
      refetch();
    },
    [createNewProject, createScene, t, refetch, setNotification, teamId],
  );

  const selectProject = useCallback(
    (project: Project) => {
      if (project.id) {
        setProject(project);
        navigate(`/settings/projects/${project.id}`);
      }
    },
    [navigate, setProject],
  );

  const [assetModalOpened, setOpenAssets] = useState(false);
  const [selectedAsset, selectAsset] = useState<string | undefined>(undefined);

  const toggleAssetModal = useCallback(
    () => setOpenAssets(!assetModalOpened),
    [assetModalOpened, setOpenAssets],
  );

  const onAssetSelect = useCallback((asset?: string) => {
    if (!asset) return;
    selectAsset(asset);
  }, []);
  useEffect(() => {
    return () => {
      gqlCache.evict({ fieldName: "projects" });
    };
  }, [gqlCache]);

  return {
    currentProjects,
    totalProjects,
    loadingProjects: loadingProjects ?? isRefetchingProjects,
    hasMoreProjects,
    teamId,
    loading,
    modalShown,
    openModal,
    handleModalClose,
    createProject,
    selectProject,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
    handleGetMoreProjects,
  };
};
