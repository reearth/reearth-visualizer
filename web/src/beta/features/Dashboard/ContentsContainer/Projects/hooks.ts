import { useApolloClient } from "@apollo/client";
import { useCallback, useMemo, useState, MouseEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { autoFillPage, onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useProjectFetcher } from "@reearth/services/api";
import { ProjectSortType, Visualizer } from "@reearth/services/gql";

import { Project } from "../../type";

const PROJECTS_VIEW_STATE_STORAGE_KEY = `reearth-visualizer-dashboard-project-view-state`;

export type SortType = "date" | "name";
const projectsPerPage = 16;
const enumTypeMapper: Partial<Record<ProjectSortType, string>> = {
  [ProjectSortType.Createdat]: "date",
  [ProjectSortType.Name]: "name",
  [ProjectSortType.Updatedat]: "date-updated",
};

function toGQLEnum(val?: SortType) {
  if (!val) return;
  return (Object.keys(enumTypeMapper) as ProjectSortType[]).find(k => enumTypeMapper[k] === val);
}
const pagination = (sort?: SortType) => {
  const reverseOrder = sort === "date" || sort === undefined;

  return {
    first: reverseOrder ? undefined : projectsPerPage,
    last: reverseOrder ? projectsPerPage : undefined,
  };
};

export default (workspaceId?: string) => {
  const { useProjectsQuery, useUpdateProject, useCreateProject } = useProjectFetcher();
  const navigate = useNavigate();
  const gqlCache = useApolloClient().cache;

  const [projectCreatorVisible, setProjectCreatorVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [sort, setSort] = useState<SortType>();
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

  const { first, last } = useMemo(() => pagination(sort), [sort]);

  const {
    projects: projectsData,
    loading,
    networkStatus,
    hasMoreProjects,
    endCursor,
    fetchMore,
    refetch,
  } = useProjectsQuery({
    teamId: workspaceId || "",
    first,
    last,
    sort: toGQLEnum(sort),
  });

  useEffect(() => {
    gqlCache.evict({ fieldName: "projects" });
  }, [gqlCache]);

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
              starred: project.starred,
            }
          : undefined,
      )
      .filter((project): project is Project => !!project);
  }, [projectNodes]);

  const isRefetchingProjects = useMemo(() => networkStatus === 3, [networkStatus]);

  const handleGetMoreProjects = useCallback(() => {
    if (hasMoreProjects) {
      fetchMore({
        variables: {
          before: endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [hasMoreProjects, fetchMore, endCursor]);

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

  const isLoading = useMemo(() => {
    return loading ?? isRefetchingProjects;
  }, [isRefetchingProjects, loading]);

  useEffect(() => {
    if (wrapperRef.current && !isLoading && hasMoreProjects)
      autoFillPage(wrapperRef, handleGetMoreProjects);
  }, [handleGetMoreProjects, hasMoreProjects, isLoading]);

  useEffect(() => {
    if (!sort) return;
    refetch();
  }, [sort, refetch]);

  const handleProjectSortChange = useCallback(
    (value?: string) => {
      if (!value) return;
      setSort((value as SortType) ?? sort);
    },
    [sort],
  );

  return {
    projects,
    hasMoreProjects,
    isLoading,
    selectedProject,
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
    handleScrollToBottom: onScrollToBottom,
    handleViewStateChange,
    handleProjectSortChange,
  };
};
