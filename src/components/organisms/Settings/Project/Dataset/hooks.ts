import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import {
  DatasetsListQuery,
  useGetProjectSceneQuery,
  useImportDatasetMutation,
  useRemoveDatasetMutation,
  useDatasetsListQuery,
} from "@reearth/gql";
import { useTeam, useProject, useNotification } from "@reearth/state";

type Nodes = NonNullable<DatasetsListQuery["datasetSchemas"]["nodes"]>;

type DatasetSchemas = NonNullable<Nodes[number]>[];

const datasetPerPage = 20;

export default (projectId: string) => {
  const intl = useIntl();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const client = useApolloClient();

  const { data: sceneData } = useGetProjectSceneQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const sceneId = sceneData?.scene?.id;

  const { data, fetchMore, loading, networkStatus } = useDatasetsListQuery({
    variables: { sceneId: sceneId ?? "", first: datasetPerPage },
    skip: !projectId,
    notifyOnNetworkStatusChange: true,
  });

  const nodes = data?.datasetSchemas.edges.map(e => e.node) ?? [];

  const datasetSchemas = nodes.filter(Boolean) as DatasetSchemas;

  const hasMoreDataSets =
    data?.datasetSchemas?.pageInfo.hasNextPage || data?.datasetSchemas?.pageInfo.hasPreviousPage;

  const isRefetchingDataSets = networkStatus === 3;

  const handleGetMoreDataSets = useCallback(() => {
    if (hasMoreDataSets) {
      fetchMore({
        variables: {
          after: data?.datasetSchemas?.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [data?.datasetSchemas?.pageInfo, fetchMore, hasMoreDataSets]);

  const [removeDatasetSchema] = useRemoveDatasetMutation();
  const handleRemoveDataset = useCallback(
    async (schemaId: string) => {
      const results = await removeDatasetSchema({
        variables: {
          schemaId,
          force: true,
        },
      });
      if (results.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to delete dataset." }),
        });
      } else {
        setNotification({
          type: "info",
          text: intl.formatMessage({ defaultMessage: "Dataset was successfully deleted." }),
        });
        // re-render
        await client.resetStore();
      }
    },
    [client, removeDatasetSchema, setNotification, intl],
  );

  // Add
  const [importData] = useImportDatasetMutation();

  const handleDatasetImport = useCallback(
    async (file: File, schemeId: string | null) => {
      if (!sceneId) return;
      await importData({
        variables: {
          file,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });
      // re-render
      await client.resetStore();
    },
    [client, importData, sceneId],
  );

  return {
    currentTeam,
    currentProject,
    datasetSchemas,
    datasetLoading: loading ?? isRefetchingDataSets,
    hasMoreDataSets,
    handleDatasetImport,
    handleRemoveDataset,
    handleGetMoreDataSets,
  };
};
