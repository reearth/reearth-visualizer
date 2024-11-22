import { gql } from "@reearth/services/gql/__gen__";

export const GET_ASSETS = gql(`
  query GetAssets($teamId: ID!, $pagination: Pagination, $keyword: String, $sort: AssetSort) {
    assets(teamId: $teamId, pagination: $pagination, keyword: $keyword, sort: $sort) {
      edges {
        cursor
        node {
          id
          teamId
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
  mutation CreateAsset($teamId: ID!, $file: Upload!, $coreSupport: Boolean!) {
    createAsset(input: { teamId: $teamId, file: $file, coreSupport: $coreSupport }) {
      asset {
        id
        teamId
        name
        size
        url
        contentType
      }
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
