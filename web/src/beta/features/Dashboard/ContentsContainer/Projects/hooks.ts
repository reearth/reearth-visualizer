import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";
import {
  autoFillPage,
  onScrollToBottom
} from "@reearth/beta/utils/infinite-scroll";
import { useProjectFetcher } from "@reearth/services/api";
import {
  ProjectSortField,
  PublishmentStatus,
  SortDirection,
  Visualizer
} from "@reearth/services/gql";
import {
  useCallback,
  useMemo,
  useState,
  MouseEvent,
  useEffect,
  useRef
} from "react";
import { useNavigate } from "react-router-dom";

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
  const {
    useProjectsQuery,
    useUpdateProject,
    useCreateProject,
    useStarredProjectsQuery,
    useImportProject,
    useUpdateProjectRecycleBin
  } = useProjectFetcher();
  const navigate = useNavigate();

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
    fetchMore,
    refetch
  } = useProjectsQuery({
    teamId: workspaceId || "",
    pagination: {
      first: pagination(sortValue).first
    },
    sort: pagination(sortValue).sortBy,
    keyword: searchTerm
  });
  const filtedProjects = useMemo(() => {
    return (projects ?? [])
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
              starred: project.starred,
              deleted: project.isDeleted
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

  // project create
  const [projectCreatorVisible, setProjectCreatorVisible] = useState(false);

  const showProjectCreator = useCallback(() => {
    setProjectCreatorVisible(true);
  }, []);
  const closeProjectCreator = useCallback(() => {
    setProjectCreatorVisible(false);
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
        data.imageUrl || ""
      );
    },
    [useCreateProject, workspaceId]
  );

  // project update
  const handleProjectUpdate = useCallback(
    async (project: Project, projectId: string) => {
      await useUpdateProject({ projectId, ...project });
      // if (sortBy) refetch();
    },
    [useUpdateProject]
  );

  // project delete
 const handleProjectDelete = useCallback(
   async (project: Project) => {
     const updatedProject = {
       projectId: project.id,
       deleted: !project.deleted
     };

     await useUpdateProjectRecycleBin(updatedProject);
   },
   [useUpdateProjectRecycleBin]
 );


  // project open
  const handleProjectOpen = useCallback(
    (sceneId?: string) => {
      if (sceneId) {
        navigate(`/scene/${sceneId}/map`);
      }
    },
    [navigate]
  );

  // selection
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const handleProjectSelect = useCallback(
    (e?: MouseEvent, projectId?: string) => {
      e?.stopPropagation();
      if (projectId) {
        setSelectedProject(
          filtedProjects.find((project) => project.id === projectId)
        );
      } else {
        setSelectedProject(undefined);
      }
    },
    [filtedProjects]
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

  const handleImportProject = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const result = await useImportProject(file);
        if (result.status === "success") {
          await refetch();
        }
      }
    },
    [useImportProject, refetch]
  );
  return {
    filtedProjects,
    hasMoreProjects,
    isLoading,
    selectedProject,
    wrapperRef,
    contentRef,
    layout,
    projectCreatorVisible,
    searchTerm,
    sortValue,
    contentWidth,
    starredProjects,
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
    handleImportProject,
    handleProjectDelete
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
