import { useApolloClient } from "@apollo/client";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Project } from "@reearth/classic/components/molecules/Dashboard/types";
import {
  useGetMeQuery,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  useGetProjectsQuery,
  Visualizer,
  GetProjectsQuery,
} from "@reearth/classic/gql";
import { useMeFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, useProject, useNotification } from "@reearth/services/state";
import { ProjectType } from "@reearth/types";

const toPublishmentStatus = (s: PublishmentStatus) =>
  s === PublishmentStatus.Public
    ? "published"
    : s === PublishmentStatus.Limited
    ? "limited"
    : "unpublished";

export type ProjectNodes = NonNullable<GetProjectsQuery["projects"]["nodes"][number]>[];

const projectPerPage = 5;

export default (workspaceId: string) => {
  const [currentWorkspace, setWorkspace] = useWorkspace();
  const [, setNotification] = useNotification();
  const [prjectType, setPrjectType] = useState<ProjectType>("classic");
  const [prjTypeSelectOpen, setPrjTypeSelectOpen] = useState(false);

  const [, setProject] = useProject();
  const navigate = useNavigate();
  const t = useT();
  const gqlCache = useApolloClient().cache;

  const [modalShown, setModalShown] = useState(false);
  const { useMeQuery } = useMeFetcher();
  const {
    me: { email = "" },
  } = useMeQuery();
  const openModal = useCallback(() => {
    if (
      window.REEARTH_CONFIG?.developerMode ||
      window.REEARTH_CONFIG?.earlyAccessAdmins?.includes(email)
    )
      setPrjTypeSelectOpen(true);
    else setModalShown(true);
  }, [email]);

  const { data, loading, refetch } = useGetMeQuery();
  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetProjects"],
  });
  const [createScene] = useCreateSceneMutation();

  if (currentWorkspace && currentWorkspace.id !== workspaceId) {
    workspaceId = currentWorkspace?.id;
  }
  const workspace = workspaceId
    ? data?.me?.teams.find(workspace => workspace.id === workspaceId)
    : data?.me?.myTeam;

  const {
    data: projectData,
    loading: loadingProjects,
    fetchMore,
    networkStatus,
  } = useGetProjectsQuery({
    variables: { teamId: workspaceId ?? "", last: projectPerPage },
    skip: !workspaceId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (workspace?.id && !currentWorkspace?.id) {
      setWorkspace(workspace);
    }
  }, [currentWorkspace, workspace, setWorkspace]);

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
            projectType: project.coreSupport ? "beta" : "classic",
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
    async (data: {
      name: string;
      description: string;
      imageUrl: string | null;
      projectType: ProjectType;
    }) => {
      if (!workspaceId) return;
      const project = await createNewProject({
        variables: {
          teamId: workspaceId,
          visualizer: Visualizer.Cesium,
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          coreSupport: data.projectType === "beta" ? true : false,
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
    [createNewProject, createScene, t, refetch, setNotification, workspaceId],
  );

  const selectProject = useCallback(
    (project: Project) => {
      if (project.id) {
        setProject(project);
        navigate(
          project.projectType === "beta"
            ? `/settings/project/${project.id}`
            : `/settings/projects/${project.id}`,
        );
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

  const handlePrjTypeSelectModalClose = useCallback(() => {
    setPrjTypeSelectOpen(false);
    setModalShown(true);
  }, []);

  const handleProjectTypeSelect = (type: ProjectType) => {
    setPrjectType(type);
    setModalShown(true);
  };

  return {
    currentProjects,
    totalProjects,
    loadingProjects: loadingProjects ?? isRefetchingProjects,
    hasMoreProjects,
    workspaceId,
    loading,
    modalShown,
    openModal,
    prjectType,
    prjTypeSelectOpen,
    handleModalClose,
    createProject,
    selectProject,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
    handleGetMoreProjects,
    handlePrjTypeSelectModalClose,
    handleProjectTypeSelect,
  };
};
