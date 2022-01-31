import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      myTeam {
        id
        name
        projects(first: 100) {
          nodes {
            id
            publishmentStatus
            isArchived
            name
            imageUrl
            description
            visualizer
            scene {
              id
            }
          }
        }
      }
      teams {
        id
        name
        members {
          user {
            id
            name
            email
          }
          userId
          role
        }
        projects(first: 100) {
          nodes {
            id
            publishmentStatus
            isArchived
            name
            imageUrl
            description
            visualizer
            scene {
              id
            }
          }
        }
      }
      auths
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $teamId: ID!
    $visualizer: Visualizer!
    $name: String!
    $description: String!
    $imageUrl: URL
  ) {
    createProject(
      input: {
        teamId: $teamId
        visualizer: $visualizer
        name: $name
        description: $description
        imageUrl: $imageUrl
      }
    ) {
      project {
        id
        name
        description
        imageUrl
      }
    }
  }
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
