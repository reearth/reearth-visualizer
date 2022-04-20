import { gql } from "@apollo/client";

import { layerFragment } from "@reearth/gql/fragments";

export const GET_DATASETS = gql`
  query GetDatasetsForDatasetInfoPane(
    $datasetSchemaId: ID!
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
  ) {
    datasets(
      datasetSchemaId: $datasetSchemaId
      first: $first
      last: $last
      after: $after
      before: $before
    ) {
      nodes {
        id
        ...DatasetFragment
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_INSTALLED_PLUGINS = gql`
  query GetScenePluginsForDatasetInfoPane($projectId: ID!) {
    scene(projectId: $projectId) {
      id
      plugins {
        pluginId
        plugin {
          id
          ...PluginFragment
        }
      }
    }
  }
`;

export const ADD_LAYER_GROUP_FROM_DATASET_SCHEMA = gql`
  mutation addLayerGroupFromDatasetSchema(
    $parentLayerId: ID!
    $pluginId: ID
    $extensionId: ID
    $datasetSchemaId: ID
    $lang: Lang
  ) {
    addLayerGroup(
      input: {
        parentLayerId: $parentLayerId
        pluginId: $pluginId
        extensionId: $extensionId
        linkedDatasetSchemaID: $datasetSchemaId
      }
    ) {
      layer {
        id
        ...Layer1Fragment
      }
      parentLayer {
        id
        ...Layer0Fragment
      }
    }
  }
  ${layerFragment}
`;
