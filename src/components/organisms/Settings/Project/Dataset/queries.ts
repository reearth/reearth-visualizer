import { gql } from "@apollo/client";

export const DATASET_SCHEMAS = gql`
  query datasetSchemas($projectId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
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
