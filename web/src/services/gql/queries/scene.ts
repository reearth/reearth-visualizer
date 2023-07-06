import { gql } from "@apollo/client";

import { projectFragment } from "../fragments";

export const GET_SCENE = gql`
  query GetScene($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        rootLayerId
        teamId
        projectId
      }
    }
  }
  ${projectFragment}
`;

export const CREATE_SCENE = gql`
  mutation CreateScene($projectId: ID!) {
    createScene(input: { projectId: $projectId }) {
      scene {
        id
      }
    }
  }
`;
