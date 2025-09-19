import { useApolloClient } from "@apollo/client";
import useLoadMore from "@reearth/app/hooks/useLoadMore";
import { ManagerLayout } from "@reearth/app/ui/components/ManagerBase";
import {
  useProject,
  useProjectImportExportMutations,
  useProjectMutations,
  useProjects,
  useStarredProjects
} from "@reearth/services/api/project";
import { toPublishmentStatus } from "@reearth/services/api/utils";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import {
  ProjectSortField,
  SortDirection,
  Visualizer
} from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import {
  useCallback,
  useMemo,
  useState,
  MouseEvent,
  useEffect,
  useRef,
  ChangeEvent
} from "react";
import { useNavigate } from "react-router-dom";

import { getImportStatus, ImportStatus, Project } from "../../type";

const PROJECTS_VIEW_STATE_STORAGE_KEY_PREFIX = `reearth-visualizer-dashboard-project-view-state`;

const PROJECTS_PER_PAGE = 16;

export type SortType =
  | "date"
  | "date-reversed"
  | "name"
  | "name-reverse"
  | "date-updated";

export default (workspaceId?: string) => {
  const {
    updateProject,
    createProject,
    updateProjectRecycleBin,
    publishProject
  } = useProjectMutations();

  const { importProject } = useProjectImportExportMutations();

  const navigate = useNavigate();
  const client = useApolloClient();
  const { projectVisibility } = appFeature();

  const [searchTerm, setSearchTerm] = useState<string>();
  const [sortValue, setSort] = useState<SortType>("date-updated");

  const { starredProjects } = useStarredProjects(workspaceId);

  const {
    projects,
    loading,
    isRefetching,
    hasMoreProjects,
    endCursor,
    fetchMore,
    refetch
  } = useProjects({
    workspaceId: workspaceId || "",
    pagination: {
      first: pagination(sortValue).first
    },
    sort: pagination(sortValue).sortBy,
    keyword: searchTerm
  });

  const t = useT();
  const [, setNotification] = useNotification();

  const filtedProjects = useMemo(() => {
    return (projects ?? [])
      .map<Project | undefined>((project) =>
        project
          ? {
              id: project.id,
              description: project.description,
              name: project.name,
              workspaceId: project.workspaceId,
              imageUrl: project.imageUrl,
              isArchived: project.isArchived,
              status: toPublishmentStatus(project.publishmentStatus),
              sceneId: project.scene?.id,
              updatedAt: new Date(project.updatedAt),
              createdAt: new Date(project.createdAt),
              coreSupport: project.coreSupport,
              starred: project.starred,
              isDeleted: project.isDeleted,
              visibility: project.visibility,
              isPublished:
                project.publishmentStatus === "PUBLIC" ||
                project.publishmentStatus === "LIMITED",
              metadata: project?.metadata
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

  const { wrapperRef, contentRef } = useLoadMore({
    data: filtedProjects,
    onLoadMore: handleGetMoreProjects
  });

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
    async (
      data: Pick<
        Project,
        "name" | "description" | "projectAlias" | "visibility"
      > & { license?: string }
    ) => {
      if (!workspaceId) return;
      await createProject(
        workspaceId,
        Visualizer.Cesium,
        data.name,
        true,
        data.projectAlias,
        data.visibility,
        data.description,
        data?.license
      );
    },
    [createProject, workspaceId]
  );

  // project update
  const handleProjectUpdate = useCallback(
    async (project: Project, projectId: string) => {
      await updateProject({ projectId, ...project });
      // if (sortBy) refetch();
    },
    [updateProject]
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
  const projectsViewStateStorageKey = `${PROJECTS_VIEW_STATE_STORAGE_KEY_PREFIX}_${workspaceId}`;

  const [layout, setLayout] = useState(
    getLayoutFromStorage(projectsViewStateStorageKey)
  );

  const handleLayoutChange = useCallback(
    (newView?: ManagerLayout) => {
      if (!newView) return;
      localStorage.setItem(projectsViewStateStorageKey, newView);
      setLayout(newView);
    },
    [projectsViewStateStorageKey]
  );

  useEffect(() => {
    setLayout(getLayoutFromStorage(projectsViewStateStorageKey));
  }, [projectsViewStateStorageKey, setLayout]);

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
  }, [wrapperRef, contentRef]);

  //import project
  const [importedProjectId, setImportedProjectId] = useState<
    string | undefined
  >();
  const [importStatus, setImportStatus] = useState<ImportStatus>();

  // TODO: connect with new API for check import status
  const [importError, _setImportError] = useState<boolean>(false);
  const handleProjectImportErrorModalClose = useCallback(() => {
    _setImportError(false);
  }, []);
  const handleProjectImportErrorLogDownload = useCallback(() => {
    // TODO: download error log
  }, []);

  const { refetch: refetchProject } = useProject(importedProjectId);

  const handleProjectImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && workspaceId) {
        setImportStatus("processing");
        const result = await importProject(file, workspaceId);
        if (
          "project_id" in result &&
          typeof result.project_id === "string" &&
          result.project_id
        ) {
          setImportedProjectId(result.project_id);
        }
      }
    },
    [workspaceId, importProject]
  );

  useEffect(() => {
    if (!importedProjectId) return;

    let retries = 0;
    const MAX_RETRIES = 100;

    const interval = setInterval(() => {
      if (++retries > MAX_RETRIES) {
        clearInterval(interval);
        return;
      }
      refetchProject().then((result) => {
        const status =
          result.data?.node?.__typename === "Project"
            ? getImportStatus(result.data.node.metadata?.importStatus)
            : undefined;

        setImportStatus(status);
        if (status === "success") {
          setNotification({
            type: "success",
            text: t("Successfully imported project!")
          });
          refetch();
        }
        if (status !== "processing") clearInterval(interval);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [importedProjectId, refetch, refetchProject, setNotification, t]);

  // project remove
  const handleProjectRemove = useCallback(
    async (project: Project) => {
      const updatedProject = {
        projectId: project.id,
        deleted: true
      };
      if (project?.status === "limited") {
        await publishProject("unpublished", project.id);
      }
      await updateProjectRecycleBin(updatedProject);

      client.cache.evict({
        id: client.cache.identify({
          __typename: "Project",
          id: project.id
        })
      });
      client.cache.gc();
    },

    [client, publishProject, updateProjectRecycleBin]
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
    importStatus,
    importError,
    projectVisibility,
    showProjectCreator,
    closeProjectCreator,
    handleGetMoreProjects,
    handleProjectUpdate,
    handleProjectOpen,
    handleProjectCreate,
    handleProjectSelect,
    handleLayoutChange,
    handleProjectSortChange,
    handleSearch,
    handleProjectImport,
    handleProjectRemove,
    handleProjectImportErrorModalClose,
    handleProjectImportErrorLogDownload
  };
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

function getLayoutFromStorage(storageKey: string): ManagerLayout {
  return ["grid", "list"].includes(localStorage.getItem(storageKey) ?? "")
    ? (localStorage.getItem(storageKey) as ManagerLayout)
    : "grid";
}
