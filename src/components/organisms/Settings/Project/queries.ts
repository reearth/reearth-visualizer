import { gql } from "@apollo/client";

export const PROJECT = gql`
  query Project($teamId: ID!) {
    projects(teamId: $teamId, first: 0, last: 100) {
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
      }
    }
  }
`;

export const UPDATE_PROJECT_BASIC_AUTH = gql`
  mutation updateProjectBasicAuth(
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

export const UPDATE_PROJECT = gql`
  mutation updateProject(
    $projectId: ID!
    $name: String
    $description: String
    $imageUrl: URL
    $publicTitle: String
    $publicDescription: String
    $publicImage: String
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

export const ARCHIVE_PROJECT = gql`
  mutation archiveProject($projectId: ID!, $archived: Boolean!) {
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

export const DELETE_PROJECT = gql`
  mutation deleteProject($projectId: ID!) {
    deleteProject(input: { projectId: $projectId }) {
      projectId
    }
  }
`;

export const UPDATE_PROJECT_ALIAS = gql`
  mutation updateProjectAlias($projectId: ID!, $alias: String!) {
    updateProject(input: { projectId: $projectId, alias: $alias }) {
      project {
        id
        name
        alias
      }
    }
  }
`;
