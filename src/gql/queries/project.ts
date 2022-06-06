import { gql } from "@apollo/client";

export const GET_PROJECT = gql`
  query GetProject($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        teamId
        projectId
        project {
          id
          alias
          publishmentStatus
          name
        }
      }
    }
  }
`;

export const GET_TEAM_PROJECTS = gql`
  query GetTeamProjects($teamId: ID!, $includeArchived: Boolean, $first: Int, $last: Int) {
    projects(teamId: $teamId, includeArchived: $includeArchived, first: $first, last: $last) {
      nodes {
        id
        name
      }
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($teamId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
    projects(teamId: $teamId, first: $first, last: $last, after: $after, before: $before) {
      edges {
        node {
          id
          name
          description
          imageUrl
          isArchived
          isBasicAuthActive
          basicAuthUsername
          basicAuthPassword
          publicTitle
          publicDescription
          publicImage
          alias
          publishmentStatus
          scene {
            id
          }
        }
      }
      nodes {
        id
        name
        description
        imageUrl
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        publicImage
        alias
        publishmentStatus
        scene {
          id
        }
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

export const CHECK_PROJECT_ALIAS = gql`
  query CheckProjectAlias($alias: String!) {
    checkProjectAlias(alias: $alias) {
      alias
      available
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

export const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(input: { projectId: $projectId }) {
      projectId
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $projectId: ID!
    $name: String
    $description: String
    $imageUrl: URL
    $publicTitle: String
    $publicDescription: String
    $publicImage: String
    $deleteImageUrl: Boolean
    $deletePublicImage: Boolean
  ) {
    updateProject(
      input: {
        projectId: $projectId
        name: $name
        description: $description
        imageUrl: $imageUrl
        publicTitle: $publicTitle
        publicDescription: $publicDescription
        publicImage: $publicImage
        deleteImageUrl: $deleteImageUrl
        deletePublicImage: $deletePublicImage
      }
    ) {
      project {
        id
        name
        description
        imageUrl
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        publicImage
        alias
        publishmentStatus
      }
    }
  }
`;

export const UPDATE_PROJECT_BASIC_AUTH = gql`
  mutation UpdateProjectBasicAuth(
    $projectId: ID!
    $isBasicAuthActive: Boolean
    $basicAuthUsername: String
    $basicAuthPassword: String
  ) {
    updateProject(
      input: {
        projectId: $projectId
        isBasicAuthActive: $isBasicAuthActive
        basicAuthUsername: $basicAuthUsername
        basicAuthPassword: $basicAuthPassword
      }
    ) {
      project {
        id
        name
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
      }
    }
  }
`;

export const UPDATE_PROJECT_ALIAS = gql`
  mutation UpdateProjectAlias($projectId: ID!, $alias: String!) {
    updateProject(input: { projectId: $projectId, alias: $alias }) {
      project {
        id
        name
        alias
      }
    }
  }
`;

export const PUBLISH_PROJECT = gql`
  mutation PublishProject($projectId: ID!, $alias: String, $status: PublishmentStatus!) {
    publishProject(input: { projectId: $projectId, alias: $alias, status: $status }) {
      project {
        id
        alias
        publishmentStatus
      }
    }
  }
`;

export const ARCHIVE_PROJECT = gql`
  mutation ArchiveProject($projectId: ID!, $archived: Boolean!) {
    updateProject(input: { projectId: $projectId, archived: $archived }) {
      project {
        id
        name
        description
        imageUrl
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        publicImage
        alias
        publishmentStatus
      }
    }
  }
`;
