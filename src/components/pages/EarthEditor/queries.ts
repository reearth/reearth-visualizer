import { gql } from "@apollo/client";

// TODO: fetch all data in scene

export const GET_SCENE = gql`
  query getScene($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        rootLayerId
      }
    }
  }
`;
