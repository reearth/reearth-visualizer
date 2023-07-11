import { gql } from "@reearth/services/gql/__gen__";

export const GET_SCENE = gql(`
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
  
`);

export const CREATE_SCENE = gql(`
  mutation CreateScene($projectId: ID!) {
    createScene(input: { projectId: $projectId }) {
      scene {
        id
      }
    }
  }
`);
