import { gql } from "@reearth/services/gql/__gen__";

export const GET_ASSETS = gql(`
  query GetAssets($teamId: ID!, $projectId: ID, $pagination: Pagination, $keyword: String, $sort: AssetSort) {
    assets(teamId: $teamId, projectId: $projectId, pagination: $pagination, keyword: $keyword, sort: $sort) {
      edges {
        cursor
        node {
          id
          teamId
          projectId
          name
          size
          url
          createdAt
          contentType
          coreSupport
        }
      }
      nodes {
        id
        teamId
        projectId
        name
        size
        url
        createdAt
        contentType
        coreSupport
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
`);

export const CREATE_ASSET = gql(`
  mutation CreateAsset($teamId: ID!, $projectId: ID, $file: Upload!, $coreSupport: Boolean!)  {
    createAsset(input: { teamId: $teamId, projectId: $projectId, file: $file, coreSupport: $coreSupport }) {
      asset {
        id
        teamId
        projectId
        name
        size
        url
        contentType
      }
    }
  }
`);

export const UPDATE_ASSET = gql(`
  mutation UpdateAsset($assetId: ID!, $projectId: ID) {
    updateAsset(input: { assetId: $assetId projectId: $projectId }) {
      assetId
      projectId
      __typename
    }
  }
`);

export const REMOVE_ASSET = gql(`
  mutation RemoveAsset($assetId: ID!) {
    removeAsset(input: { assetId: $assetId }) {
      assetId
    }
  }
`);
