import { useCallback, useMemo, useState, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectFetcher } from "@reearth/services/api";
import { Visualizer } from "@reearth/services/gql";

import { Project } from "../../type";

export default (workspaceId?: string) => {
  const { useProjectsQuery, useUpdateProject, useCreateProject } = useProjectFetcher();
  const navigate = useNavigate();
  const state = localStorage.getItem("viewState");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [viewState, setViewState] = useState(state ? state : "grid");
  const [isStarred, setIsStarred] = useState<Record<string, boolean>>({});

  const handleProjectCreate = useCallback(
    async (data: Pick<Project, "name" | "description" | "imageUrl">) => {
      if (!workspaceId) return;
      await useCreateProject(
        workspaceId,
        Visualizer.Cesium,
        data.name,
        true,
        data.description,
        data.imageUrl || "",
      );
    },
    [useCreateProject, workspaceId],
  );

  const handleProjectUpdate = useCallback(
    async (project: Project, projectId: string) => {
      await useUpdateProject({ projectId, ...project });
    },
    [useUpdateProject],
  );

  const {
    projects: projectsData,
    loading,
    fetchMore,
    networkStatus,
  } = useProjectsQuery(workspaceId);

  const projectNodes = projectsData?.edges.map(e => e.node);

  console.log("loading", loading);
  console.log("projectsData", projectsData);

  const projects = useMemo(() => {
    return (projectNodes ?? [])
      .map<Project | undefined>(project =>
        project
          ? {
              id: project.id,
              description: project.description,
              name: project.name,
              imageUrl: project.imageUrl,
              isArchived: project.isArchived,
              sceneId: project.scene?.id,
              updatedAt: project.updatedAt.toString(),
            }
          : undefined,
      )
      .filter((project): project is Project => !!project);
  }, [projectNodes]);

  console.log("projects", projects);

  const hasMoreProjects =
    projectsData?.pageInfo?.hasNextPage || projectsData?.pageInfo?.hasPreviousPage;

  const isRefetchingProjects = networkStatus === 3;

  const handleGetMoreProjects = useCallback(() => {
    if (hasMoreProjects) {
      fetchMore({
        variables: {
          before: projectsData?.pageInfo?.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [hasMoreProjects, fetchMore, projectsData?.pageInfo?.endCursor]);

  const selectedProject = useMemo(
    () => projects.find(project => project.id === selectedProjectId) || undefined,
    [projects, selectedProjectId],
  );

  const handleProjectSelect = useCallback(
    (projectId: string | undefined) =>
      setSelectedProjectId(prevId =>
        prevId === projectId || projectId === undefined ? undefined : projectId,
      ),
    [],
  );

  const handleVisibility = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  const handleViewChange = (newView: "grid" | "list") => {
    localStorage.setItem("viewState", newView);
    setViewState(newView);
  };

  const handleProjectOpen = useCallback(
    (sceneId?: string) => {
      if (sceneId) {
        navigate(`/scene/${sceneId}/map`);
      }
    },
    [navigate],
  );

  const handleStarClick = useCallback((e: MouseEvent, projectId: string) => {
    e.stopPropagation();
    setIsStarred(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  }, []);

  return {
    projects,
    hasMoreProjects,
    projectLoading: loading ?? isRefetchingProjects,
    selectedProject,
    selectedProjectId,
    viewState,
    visible,
    isStarred,
    handleVisibility,
    handleViewChange,
    handleGetMoreProjects,
    handleProjectUpdate,
    handleProjectOpen,
    handleProjectCreate,
    handleProjectSelect,
    handleStarClick,
  };
};
