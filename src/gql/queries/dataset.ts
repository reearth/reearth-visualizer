import { gql } from "@apollo/client";

import { layerFragment, propertyFragment } from "@reearth/gql/fragments";

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

export const GET_DATASET_SCHEMAS = gql`
  query GetDatasetSchemas(
    $projectId: ID!
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
  ) {
    scene(projectId: $projectId) {
      id
      datasetSchemas(first: $first, last: $last, after: $after, before: $before) {
        nodes {
          id
          source
          name
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        totalCount
      }
    }
  }
`;

export const GET_LINKABLE_DATASETS = gql`
  query GetLinkableDatasets($sceneId: ID!) {
    datasetSchemas(sceneId: $sceneId, first: 100) {
      nodes {
        id
        source
        name
        fields {
          id
          name
          type
        }
        datasets(first: 100) {
          totalCount
          nodes {
            id
            name
            fields {
              fieldId
              type
            }
          }
        }
      }
    }
  }

  ${layerFragment}
`;

export const IMPORT_DATASET = gql`
  mutation ImportDataset($file: Upload!, $sceneId: ID!, $datasetSchemaId: ID) {
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

export const LINK_DATASET = gql`
  mutation LinkDataset(
    $propertyId: ID!
    $itemId: ID
    $schemaGroupId: ID
    $fieldId: ID!
    $datasetSchemaIds: [ID!]!
    $datasetIds: [ID!]
    $datasetFieldIds: [ID!]!
    $lang: Lang
  ) {
    linkDatasetToPropertyValue(
      input: {
        propertyId: $propertyId
        itemId: $itemId
        schemaGroupId: $schemaGroupId
        fieldId: $fieldId
        datasetSchemaIds: $datasetSchemaIds
        datasetIds: $datasetIds
        datasetSchemaFieldIds: $datasetFieldIds
      }
    ) {
      property {
        id
        ...PropertyFragment
      }
    }
  }

  ${propertyFragment}
`;

export const UNLINK_DATASET = gql`
  mutation UnlinkDataset(
    $propertyId: ID!
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
    $lang: Lang
  ) {
    unlinkPropertyValue(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        fieldId: $fieldId
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const SYNC_DATASET = gql`
  mutation SyncDataset($sceneId: ID!, $url: String!) {
    syncDataset(input: { sceneId: $sceneId, url: $url }) {
      sceneId
      url
      datasetSchema {
        id
        source
        name
      }
      dataset {
        id
        source
        schemaId
        name
      }
    }
  }
`;

export const IMPORT_DATASET_FROM_GOOGLE_SHEET = gql`
  mutation ImportDatasetFromGoogleSheet(
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
