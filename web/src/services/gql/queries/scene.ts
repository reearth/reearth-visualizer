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
