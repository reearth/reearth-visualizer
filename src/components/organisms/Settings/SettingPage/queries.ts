import { gql } from "@apollo/client";

export const SCENE = gql`
  query Scene($projectId: ID!) {
    scene(projectId: $projectId) {
      id
      projectId
      teamId
    }
  }
`;
