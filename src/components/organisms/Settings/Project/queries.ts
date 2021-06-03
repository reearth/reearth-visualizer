import { gql } from "@apollo/client";

export const PROJECT = gql`
  query Project($teamId: ID!) {
    projects(teamId: $teamId, first: 0, last: 100) {
      nodes {
        id
        name
        description
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        imageUrl
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

export const UPDATE_PROJECT_NAME = gql`
  mutation updateProjectName($projectId: ID!, $name: String!) {
    updateProject(input: { projectId: $projectId, name: $name }) {
      project {
        id
        name
        description
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        imageUrl
        alias
        publishmentStatus
      }
    }
  }
`;

export const UPDATE_PROJECT_DESCRIPTION = gql`
  mutation updateProjectDescription($projectId: ID!, $description: String!) {
    updateProject(input: { projectId: $projectId, description: $description }) {
      project {
        id
        name
        description
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        imageUrl
        alias
        publishmentStatus
      }
    }
  }
`;

export const UPDATE_PROJECT_IMAGE_URL = gql`
  mutation updateProjectImageUrl($projectId: ID!, $imageUrl: URL) {
    updateProject(input: { projectId: $projectId, imageUrl: $imageUrl }) {
      project {
        id
        name
        description
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        imageUrl
        alias
        publishmentStatus
      }
    }
  }
`;

export const UPDATE_PROJECT_PUBLIC_TITLE = gql`
  mutation updateProjectPublicTitle($projectId: ID!, $publicTitle: String!) {
    updateProject(input: { projectId: $projectId, publicTitle: $publicTitle }) {
      project {
        id
        name
        description
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        imageUrl
        alias
        publishmentStatus
      }
    }
  }
`;

export const UPDATE_PROJECT_PUBLIC_DESCRIPTION = gql`
  mutation updateProjectPublicDescription($projectId: ID!, $publicDescription: String!) {
    updateProject(input: { projectId: $projectId, publicDescription: $publicDescription }) {
      project {
        id
        name
        description
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        imageUrl
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
        isArchived
        isBasicAuthActive
        basicAuthUsername
        basicAuthPassword
        publicTitle
        publicDescription
        imageUrl
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
