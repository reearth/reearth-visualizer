import { gql } from "@apollo/client";

import { layerFragment } from "@reearth/gql/fragments";

export const GET_ALL_DATASETS = gql`
  query GetAllDataSets($sceneId: ID!) {
    datasetSchemas(sceneId: $sceneId, first: 100) {
      nodes {
        id
        source
        name
        sceneId
        fields {
          id
          name
          type
        }
        datasets {
          totalCount
        }
      }
    }
  }
`;

export const SYNC_DATASET = gql`
  mutation SyncDataset($sceneId: ID!, $url: String!) {
    syncDataset(input: { sceneId: $sceneId, url: $url }) {
      sceneId
      url
      datasetSchema {
        id
        name
      }
    }
  }
`;

export const IMPORT_GOOGLE_SHEET_DATASET = gql`
  mutation importGoogleSheetDataset(
    $accessToken: String!
    $fileId: String!
    $sheetName: String!
    $sceneId: ID!
    $datasetSchemaId: ID
  ) {
    importDatasetFromGoogleSheet(
      input: {
        accessToken: $accessToken
        fileId: $fileId
        sheetName: $sheetName
        sceneId: $sceneId
        datasetSchemaId: $datasetSchemaId
      }
    ) {
      datasetSchema {
        id
        name
      }
    }
  }
`;

export const IMPORT_DATASET = gql`
  mutation importDataset($file: Upload!, $sceneId: ID!, $datasetSchemaId: ID) {
    importDataset(input: { file: $file, sceneId: $sceneId, datasetSchemaId: $datasetSchemaId }) {
      datasetSchema {
        id
        name
      }
    }
  }
`;

export const REMOVE_DATASET = gql`
  mutation RemoveDataset($schemaId: ID!, $force: Boolean) {
    removeDatasetSchema(input: { schemaId: $schemaId, force: $force }) {
      schemaId
    }
  }
`;

export const ADD_LAYER_GROUP_FROM_DATASET_SCHEMA = gql`
  mutation addLayerGroupFromDatasetSchema(
    $parentLayerId: ID!
    $pluginId: PluginID
    $extensionId: PluginExtensionID
    $datasetSchemaId: ID
    $index: Int
  ) {
    addLayerGroup(
      input: {
        parentLayerId: $parentLayerId
        pluginId: $pluginId
        extensionId: $extensionId
        linkedDatasetSchemaID: $datasetSchemaId
        index: $index
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
