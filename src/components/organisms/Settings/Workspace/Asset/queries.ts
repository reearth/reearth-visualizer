import { gql } from "@apollo/client";

export const ASSETS = gql`
  query Assets($teamId: ID!) {
    assets(teamId: $teamId, first: 0, last: 300) {
      edges {
        cursor
        node {
          id
          teamId
          name
          size
          url
          contentType
        }
      }
      nodes {
        id
        teamId
        name
        size
        url
        contentType
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
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset($teamId: ID!, $file: Upload!) {
    createAsset(input: { teamId: $teamId, file: $file }) {
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
`;

export const REMOVE_ASSET = gql`
  mutation RemoveAsset($assetId: ID!) {
    removeAsset(input: { assetId: $assetId }) {
      assetId
    }
  }
`;
