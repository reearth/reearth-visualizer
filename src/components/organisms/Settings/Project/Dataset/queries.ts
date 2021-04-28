import { gql } from "@apollo/client";

export const DATASET_SCHEMAS = gql`
  query datasetSchemas($projectId: ID!) {
    scene(projectId: $projectId) {
      id
      datasetSchemas(first: 100) {
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

export const SYNC_DATASET = gql`
  mutation syncDatasetTest($sceneId: ID!, $url: String!) {
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

export const REMOVE_DATASET_SCHEMA = gql`
  mutation removeDatasetSchema($schemaId: ID!) {
    removeDatasetSchema(input: { schemaId: $schemaId }) {
      schemaId
    }
  }
`;
