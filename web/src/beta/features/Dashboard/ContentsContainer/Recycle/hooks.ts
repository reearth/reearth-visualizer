import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";
import {
  autoFillPage,
  onScrollToBottom
} from "@reearth/beta/utils/infinite-scroll";
import { useProjectFetcher } from "@reearth/services/api";
import {
  ProjectSortField,
  PublishmentStatus,
  SortDirection
} from "@reearth/services/gql";
import {
  useCallback,
  useMemo,
  useState,
  MouseEvent,
  useEffect,
  useRef
} from "react";

import { Project } from "../../type";

const PROJECTS_VIEW_STATE_STORAGE_KEY = `reearth-visualizer-dashboard-project-view-state`;

const PROJECTS_PER_PAGE = 16;

export type SortType =
  | "date"
  | "date-reversed"
  | "name"
  | "name-reverse"
  | "date-updated";

export default (workspaceId?: string) => {
  const { useProjectsQuery, useStarredProjectsQuery, useArchiveProject } =
    useProjectFetcher();

  const [searchTerm, setSearchTerm] = useState<string>();
  const [sortValue, setSort] = useState<SortType>("date-updated");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { starredProjects } = useStarredProjectsQuery(workspaceId);

  const {
    projects,
    loading,
    isRefetching,
    hasMoreProjects,
    endCursor,
    fetchMore
  } = useProjectsQuery({
    includeArchived: true,
    teamId: workspaceId || "",
    pagination: {
      first: pagination(sortValue).first
    },
    sort: pagination(sortValue).sortBy,
    keyword: searchTerm
  });

  const archivedProjects = useMemo(() => {
    return (projects ?? [])
      .filter((project) => project?.isArchived === true)
      .filter((project) => project?.coreSupport === true)
      .map<Project | undefined>((project) =>
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
              starred: project.starred
            }
          : undefined
      )
      .filter((project): project is Project => !!project);
  }, [projects]);

  const isFetchingMore = useRef(false);

  const handleGetMoreProjects = useCallback(async () => {
    if (isFetchingMore.current) return;
    if (hasMoreProjects) {
      isFetchingMore.current = true;
      await fetchMore({
        variables: {
          pagination: {
            after: endCursor,
            first: PROJECTS_PER_PAGE
          }
        }
      });
      isFetchingMore.current = false;
    }
  }, [hasMoreProjects, fetchMore, endCursor]);

  const isLoading = useMemo(() => {
    return loading || isRefetching;
  }, [isRefetching, loading]);

  useEffect(() => {
    if (wrapperRef.current && !isLoading && hasMoreProjects) {
      handleGetMoreProjects();
    }
    autoFillPage(wrapperRef, handleGetMoreProjects);
  }, [handleGetMoreProjects, projects, hasMoreProjects, isLoading]);

  const handleProjectSortChange = useCallback(
    (value?: string) => {
      if (!value) return;
      setSort((value as SortType) ?? sortValue);
    },
    [sortValue]
  );

  // search
  const handleSearch = useCallback((value?: string) => {
    if (!value || value.length < 1) {
      setSearchTerm?.(undefined);
    } else {
      setSearchTerm?.(value);
    }
  }, []);

  // archive project
  const handleArchiveProject = useCallback(
    async (archived: boolean, projectId: string) => {
      await useArchiveProject({ projectId, archived });
    },
    [useArchiveProject]
  );

  // selection
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const handleProjectSelect = useCallback(
    (e?: MouseEvent, projectId?: string) => {
      e?.stopPropagation();
      if (projectId) {
        setSelectedProject(
          archivedProjects.find((project) => project.id === projectId)
        );
      } else {
        setSelectedProject(undefined);
      }
    },
    [archivedProjects]
  );

  // layout
  const [layout, setLayout] = useState(
    ["grid", "list"].includes(
      localStorage.getItem(PROJECTS_VIEW_STATE_STORAGE_KEY) ?? ""
    )
      ? (localStorage.getItem(PROJECTS_VIEW_STATE_STORAGE_KEY) as ManagerLayout)
      : "grid"
  );

  const handleLayoutChange = useCallback((newView?: ManagerLayout) => {
    if (!newView) return;
    localStorage.setItem(PROJECTS_VIEW_STATE_STORAGE_KEY, newView);
    setLayout(newView);
  }, []);

  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const parentElement = wrapperRef.current;
    const childElement = contentRef.current;

    if (!parentElement || !childElement) return;
    const checkSize = () => {
      if (childElement && parentElement) {
        setContentWidth(childElement.offsetWidth);
      }
    };

    const parentObserver = new ResizeObserver(checkSize);
    const childObserver = new ResizeObserver(checkSize);
    parentObserver.observe(parentElement);
    childObserver.observe(childElement);

    checkSize();
    return () => {
      parentObserver.disconnect();
      childObserver.disconnect();
    };
  }, []);

  return {
    archivedProjects,
    hasMoreProjects,
    isLoading,
    selectedProject,
    wrapperRef,
    contentRef,
    layout,
    searchTerm,
    sortValue,
    contentWidth,
    starredProjects,
    handleGetMoreProjects,
    handleArchiveProject,
    handleProjectSelect,
    handleScrollToBottom: onScrollToBottom,
    handleLayoutChange,
    handleProjectSortChange,
    handleSearch
  };
};

export const toPublishmentStatus = (s?: PublishmentStatus) => {
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
      first = PROJECTS_PER_PAGE;
      sortBy = {
        field: ProjectSortField.Createdat,
        direction: SortDirection.Desc
      };
      break;
    case "date-reversed":
      first = PROJECTS_PER_PAGE;
      sortBy = {
        field: ProjectSortField.Createdat,
        direction: SortDirection.Asc
      };
      break;
    case "date-updated":
      first = PROJECTS_PER_PAGE;
      sortBy = {
        field: ProjectSortField.Updatedat,
        direction: SortDirection.Desc
      };
      break;
    case "name":
      first = PROJECTS_PER_PAGE;
      sortBy = {
        field: ProjectSortField.Name,
        direction: SortDirection.Asc
      };
      break;
    case "name-reverse":
      first = PROJECTS_PER_PAGE;
      sortBy = {
        field: ProjectSortField.Name,
        direction: SortDirection.Desc
      };
      break;
    default:
      first = PROJECTS_PER_PAGE;
  }

  return { first, last, sortBy };
};
