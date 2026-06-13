import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  GetDeletedProjectsQueryVariables,
  GetProjectsQueryVariables,
  GetStarredProjectsQueryVariables,
  HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION
} from "@reearth/services/gql";
import {
  CHECK_PROJECT_ALIAS,
  GET_DELETED_PROJECTS,
  GET_PROJECT,
  GET_PROJECTS,
  GET_STARRED_PROJECTS
} from "@reearth/services/gql/queries/project";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback, useMemo } from "react";

export const useProject = (projectId?: string) => {
  const { data, ...rest } = useQuery(GET_PROJECT, {
    variables: { projectId: projectId ?? "" },
    skip: !projectId
  });

  const project = useMemo(
    () => (data?.node?.__typename === "Project" ? data.node : undefined),
    [data?.node]
  );

  return { project, ...rest };
};

export const useProjects = (input: GetProjectsQueryVariables) => {
  const { data, networkStatus, ...rest } = useQuery(GET_PROJECTS, {
    variables: input,
    skip: !input.workspaceId,
    notifyOnNetworkStatusChange: true
  });

  const projects = useMemo(
    () => data?.projects?.edges.map((e) => e.node),
    [data?.projects]
  );

  const hasMoreProjects = useMemo(
    () =>
      data?.projects.pageInfo?.hasNextPage ||
      data?.projects.pageInfo?.hasPreviousPage,
    [
      data?.projects.pageInfo?.hasNextPage,
      data?.projects.pageInfo?.hasPreviousPage
    ]
  );
  const isRefetching = useMemo(() => networkStatus < 7, [networkStatus]);
  const endCursor = useMemo(
    () => data?.projects.pageInfo?.endCursor,
    [data?.projects.pageInfo?.endCursor]
  );

  return { projects, hasMoreProjects, isRefetching, endCursor, ...rest };
};

export const useStarredProjects = (input: GetStarredProjectsQueryVariables) => {
  const { data, networkStatus, ...rest } = useQuery(GET_STARRED_PROJECTS, {
    variables: input,
    skip: !input.workspaceId,
    notifyOnNetworkStatusChange: true
  });

  const starredProjects = useMemo(
    () => data?.starredProjects.nodes,
    [data?.starredProjects]
  );
  const hasMoreStarredProjects = useMemo(
    () => data?.starredProjects.pageInfo?.hasNextPage,
    [data?.starredProjects.pageInfo?.hasNextPage]
  );
  const isRefetching = useMemo(() => networkStatus < 7, [networkStatus]);
  const endCursor = useMemo(
    () => data?.starredProjects.pageInfo?.endCursor,
    [data?.starredProjects.pageInfo?.endCursor]
  );

  return {
    starredProjects,
    hasMoreStarredProjects,
    isRefetching,
    endCursor,
    ...rest
  };
};

export const useDeletedProjects = (input: GetDeletedProjectsQueryVariables) => {
  const { data, networkStatus, ...rest } = useQuery(GET_DELETED_PROJECTS, {
    variables: input,
    skip: !input.workspaceId,
    notifyOnNetworkStatusChange: true
  });

  const deletedProjects = useMemo(
    () => data?.deletedProjects.nodes,
    [data?.deletedProjects]
  );

  const hasMoreDeletedProjects = useMemo(
    () => data?.deletedProjects.pageInfo?.hasNextPage,
    [data?.deletedProjects.pageInfo?.hasNextPage]
  );
  const isRefetching = useMemo(() => networkStatus < 7, [networkStatus]);
  const endCursor = useMemo(
    () => data?.deletedProjects.pageInfo?.endCursor,
    [data?.deletedProjects.pageInfo?.endCursor]
  );
  return {
    deletedProjects,
    hasMoreDeletedProjects,
    isRefetching,
    endCursor,
    ...rest
  };
};

export const useValidateProjectAlias = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [fetchCheckProjectAlias] = useLazyQuery(CHECK_PROJECT_ALIAS, {
    fetchPolicy: "network-only" // Disable caching for this query
  });

  const validateProjectAlias = useCallback(
    async (alias: string, workspaceId: string, projectId?: string) => {
      if (!alias) return null;

      const { data, error } = await fetchCheckProjectAlias({
        variables: { alias, workspaceId, projectId },
        context: {
          headers: {
            [HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION]: "true"
          }
        }
      });

      if (error || !data?.checkProjectAlias) {
        // Extract graphQLErrors for backward compatibility with UI code
        const errors =
          error && "errors" in error
            ? (error.errors as { extensions?: { description?: string } }[])
            : undefined;
        return { status: "error", errors };
      }

      setNotification({
        type: "success",
        text: t("Successfully checked alias!")
      });
      return {
        available: data?.checkProjectAlias.available,
        alias: data?.checkProjectAlias.alias,
        status: "success"
      };
    },
    [fetchCheckProjectAlias, setNotification, t]
  );

  return {
    validateProjectAlias
  };
};
