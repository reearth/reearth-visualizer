import { gql } from "@reearth/services/gql/__gen__";

export const GET_PROJECT = gql(`
  query GetProject($projectId: ID!) {
    node(id: $projectId, type: PROJECT) {
      id
      ... on Project {
        ...ProjectFragment
        scene {
          id
        }
      }
    }
  }
`);

export const GET_PROJECTS = gql(`
  query GetProjects($teamId: ID!, $pagination: Pagination, $keyword: String, $sort: ProjectSort) {
    projects(teamId: $teamId, pagination: $pagination, keyword: $keyword, sort: $sort) {
      edges {
        node {
          id
          ...ProjectFragment
          scene {
            id
          }
        }
      }
      nodes {
        id
        ...ProjectFragment
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
`);

export const CHECK_PROJECT_ALIAS = gql(`
  query CheckProjectAlias($alias: String!) {
    checkProjectAlias(alias: $alias) {
      alias
      available
    }
  }
`);

export const CREATE_PROJECT = gql(`
  mutation CreateProject(
    $teamId: ID!
    $visualizer: Visualizer!
    $name: String!
    $description: String!
    $imageUrl: URL
    $coreSupport: Boolean
  ) {
    createProject(
      input: {
        teamId: $teamId
        visualizer: $visualizer
        name: $name
        description: $description
        imageUrl: $imageUrl
        coreSupport: $coreSupport
      }
    ) {
      project {
        id
        name
        description
        imageUrl
        coreSupport
      }
    }
  }
`);

export const UPDATE_PROJECT = gql(`
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
    $enableGa: Boolean
    $trackingId: String
    $starred:Boolean
    $deleted: Boolean
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
        enableGa: $enableGa
        trackingId: $trackingId
        starred: $starred
        deleted: $deleted
      }
    ) {
      project {
        id
        ...ProjectFragment
      }
    }
  }

`);

export const UPDATE_PROJECT_BASIC_AUTH = gql(`
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
`);

export const UPDATE_PROJECT_ALIAS = gql(`
  mutation UpdateProjectAlias($projectId: ID!, $alias: String!) {
    updateProject(input: { projectId: $projectId, alias: $alias }) {
      project {
        id
        name
        alias
      }
    }
  }
`);

export const PUBLISH_PROJECT = gql(`
  mutation PublishProject($projectId: ID!, $alias: String, $status: PublishmentStatus!) {
    publishProject(input: { projectId: $projectId, alias: $alias, status: $status }) {
      project {
        id
        alias
        publishmentStatus
      }
    }
  }
`);

export const ARCHIVE_PROJECT = gql(`
  mutation ArchiveProject($projectId: ID!, $archived: Boolean!) {
    updateProject(input: { projectId: $projectId, archived: $archived }) {
      project {
        id
        isArchived
      }
    }
  }
`);

export const DELETE_PROJECT = gql(`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(input: { projectId: $projectId }) {
      projectId
    }
  }
`);

export const GET_STARRED_PROJECTS = gql(`
  query GetStarredProjects($teamId: ID!) {
    starredProjects(teamId: $teamId) {
				nodes {
					id
					name
					starred
          scene {
            id
          }
				}
				totalCount
			}
  }
`);

export const EXPORT_PROJECT = gql(`
  mutation ExportProject($projectId: ID!) {
    exportProject(input: { projectId: $projectId }) {
      projectDataPath
    }
  }
`);

export const IMPORT_PROJECT = gql(`
  mutation ImportProject($file: Upload!) {
    importProject(input: { file: $file }) {
      projectData
    }
  }
`);

export const GET_DELETED_PROJECTS = gql(`
  query GetDeletedProjects($teamId: ID!) {
    deletedProjects(teamId: $teamId) {
			nodes {
				id
				name
				isDeleted
        imageUrl
				}
			totalCount
		}
  }
`);
