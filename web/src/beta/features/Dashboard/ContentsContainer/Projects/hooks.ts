import { useCallback, useMemo, useState, MouseEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { autoFillPage, onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useProjectFetcher } from "@reearth/services/api";
import { Visualizer } from "@reearth/services/gql";

import { Project } from "../../type";

const PROJECTS_VIEW_STATE_STORAGE_KEY = `reearth-visualizer-dashboard-project-view-state`;

export default (workspaceId?: string) => {
  const { useProjectsQuery, useUpdateProject, useCreateProject } = useProjectFetcher();
  const navigate = useNavigate();
  const [projectCreatorVisible, setProjectCreatorVisible] = useState(false);
  const [isStarred, setIsStarred] = useState<Record<string, boolean>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const [viewState, setViewState] = useState(
    localStorage.getItem(PROJECTS_VIEW_STATE_STORAGE_KEY)
      ? localStorage.getItem(PROJECTS_VIEW_STATE_STORAGE_KEY)
      : "grid",
  );
  const handleViewStateChange = useCallback((newView?: string) => {
    if (!newView) return;
    localStorage.setItem(PROJECTS_VIEW_STATE_STORAGE_KEY, newView);
    setViewState(newView);
  }, []);

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

  const projects = useMemo(() => {
    return (projectNodes ?? [])
      .filter(project => project?.coreSupport === true)
      .map<Project | undefined>(project =>
        project
          ? {
              id: project.id,
              description: project.description,
              name: project.name,
              imageUrl: project.imageUrl,
              isArchived: project.isArchived,
              sceneId: project.scene?.id,
              updatedAt: new Date(project.updatedAt),
              createdAt: new Date(project.createdAt),
              coreSupport: project.coreSupport,
            }
          : undefined,
      )
      .filter((project): project is Project => !!project);
  }, [projectNodes]);

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

  const handleProjectSelect = useCallback(
    (e?: MouseEvent, projectId?: string) => {
      e?.stopPropagation();
      if (projectId) {
        setSelectedProject(projects.find(project => project.id === projectId));
      } else {
        setSelectedProject(undefined);
      }
    },
    [projects],
  );

  const showProjectCreator = useCallback(() => {
    setProjectCreatorVisible(true);
  }, []);
  const closeProjectCreator = useCallback(() => {
    setProjectCreatorVisible(false);
  }, []);

  const handleProjectOpen = useCallback(
    (sceneId?: string) => {
      if (sceneId) {
        navigate(`/scene/${sceneId}/map`);
      }
    },
    [navigate],
  );

  const handleProjectStarClick = useCallback((e: MouseEvent, projectId: string) => {
    e.stopPropagation();
    setIsStarred(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  }, []);

  const isLoading = useMemo(() => {
    return loading ?? isRefetchingProjects;
  }, [isRefetchingProjects, loading]);

  useEffect(() => {
    if (wrapperRef.current && !isLoading && hasMoreProjects)
      autoFillPage(wrapperRef, handleGetMoreProjects);
  }, [handleGetMoreProjects, hasMoreProjects, isLoading]);

  return {
    projects,
    hasMoreProjects,
    isLoading,
    selectedProject,
    isStarred,
    wrapperRef,
    viewState,
    projectCreatorVisible,
    showProjectCreator,
    closeProjectCreator,
    handleGetMoreProjects,
    handleProjectUpdate,
    handleProjectOpen,
    handleProjectCreate,
    handleProjectSelect,
    handleProjectStarClick,
    handleScrollToBottom: onScrollToBottom,
    handleViewStateChange,
  };
};
