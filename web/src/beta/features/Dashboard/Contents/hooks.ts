import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectFetcher } from "@reearth/services/api";
import { Visualizer } from "@reearth/services/gql";

import { Project } from "../type";

export default (workspaceId?: string) => {
  const gqlCache = useApolloClient().cache;
  const { useProjectsQuery, useUpdateProject, useCreateProject } = useProjectFetcher();
  const navigate = useNavigate();

  const handleOnClickProject = useCallback(
    (sceneId?: string) => {
      if (sceneId) {
        navigate(`/scene/${sceneId}/map`);
      }
    },
    [navigate],
  );

  const handleCreateProject = useCallback(
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

  const handleUpdateProject = useCallback(
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

  useEffect(() => {
    gqlCache.evict({ fieldName: "projects" });
  }, [gqlCache]);

  return {
    projects,
    hasMoreProjects,
    projectLoading: loading ?? isRefetchingProjects,
    handleGetMoreProjects,
    handleUpdateProject,
    handleOnClickProject,
    handleCreateProject,
  };
};
