import { useApolloClient } from "@apollo/client";
import { useCallback, useMemo, useState, MouseEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";
import { autoFillPage, onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useProjectFetcher } from "@reearth/services/api";
import { ProjectSortType, PublishmentStatus, Visualizer } from "@reearth/services/gql";

import { Project } from "../../type";

const PROJECTS_VIEW_STATE_STORAGE_KEY = `reearth-visualizer-dashboard-project-view-state`;

export type SortType = "date" | "date-reversed" | "name" | "name-reverse" | "date-updated";
const projectsPerPage = 16;

const toPublishmentStatus = (s: PublishmentStatus) => {
  switch (s) {
    case PublishmentStatus.Public:
      return "published";
    case PublishmentStatus.Limited:
      return "limited";
    default:
      return "unpublished";
  }
};

const pagination = (sort?: SortType) => {
  let first, last;
  let sortBy;
  switch (sort) {
    case "date":
      last = projectsPerPage;
      sortBy = ProjectSortType.Createdat;
      break;
    case "date-reversed":
      first = projectsPerPage;
      sortBy = ProjectSortType.Createdat;
      break;
    case "date-updated":
      last = projectsPerPage;
      sortBy = ProjectSortType.Updatedat;
      break;
    case "name":
      first = projectsPerPage;
      sortBy = ProjectSortType.Name;
      break;
    case "name-reverse":
      last = projectsPerPage;
      sortBy = ProjectSortType.Name;
      break;
    default:
      last = projectsPerPage;
  }

  return { first, last, sortBy };
};

export default (workspaceId?: string) => {
  const { useProjectsQuery, useUpdateProject, useCreateProject } = useProjectFetcher();
  const navigate = useNavigate();
  const gqlCache = useApolloClient().cache;
  const [searchTerm, setSearchTerm] = useState<string>();

  const [projectCreatorVisible, setProjectCreatorVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [sortValue, setSort] = useState<SortType>("date");

  const [layout, setLayout] = useState(
    ["grid", "list"].includes(localStorage.getItem(PROJECTS_VIEW_STATE_STORAGE_KEY) ?? "")
      ? (localStorage.getItem(PROJECTS_VIEW_STATE_STORAGE_KEY) as ManagerLayout)
      : "grid",
  );

  const handleLayoutChange = useCallback((newView?: ManagerLayout) => {
    if (!newView) return;
    localStorage.setItem(PROJECTS_VIEW_STATE_STORAGE_KEY, newView);
    setLayout(newView);
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

  const { first, last, sortBy } = useMemo(() => pagination(sortValue), [sortValue]);

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
    sort: sortBy,
    keyword: searchTerm,
  });

  const handleProjectUpdate = useCallback(
    async (project: Project, projectId: string) => {
      await useUpdateProject({ projectId, ...project });
      if (sortBy) refetch();
    },
    [refetch, sortBy, useUpdateProject],
  );

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
              status: toPublishmentStatus(project.publishmentStatus),
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

  const favoriteProjects: Project[] = useMemo(() => {
    return projects.filter(project => project.starred === true);
  }, [projects]);

  const isRefetchingProjects = useMemo(() => networkStatus === 7, [networkStatus]);

  const handleGetMoreProjects = useCallback(() => {
    if (hasMoreProjects) {
      fetchMore({
        variables: {
          before: last ? endCursor : undefined,
          after: first ? endCursor : undefined,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [hasMoreProjects, fetchMore, last, endCursor, first]);

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
    refetch();
  }, [sortValue, refetch, searchTerm]);

  const handleProjectSortChange = useCallback(
    (value?: string) => {
      if (!value) return;
      setSort((value as SortType) ?? sortValue);
    },
    [sortValue],
  );

  const handleSearch = useCallback((value?: string) => {
    if (!value || value.length < 1) {
      setSearchTerm?.(undefined);
    } else {
      setSearchTerm?.(value);
    }
  }, []);

  return {
    projects,
    hasMoreProjects,
    isLoading,
    selectedProject,
    wrapperRef,
    layout,
    projectCreatorVisible,
    favoriteProjects,
    searchTerm,
    sortValue,
    showProjectCreator,
    closeProjectCreator,
    handleGetMoreProjects,
    handleProjectUpdate,
    handleProjectOpen,
    handleProjectCreate,
    handleProjectSelect,
    handleScrollToBottom: onScrollToBottom,
    handleLayoutChange,
    handleProjectSortChange,
    handleSearch,
  };
};
