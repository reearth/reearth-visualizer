import { gql } from "@reearth/services/gql/__gen__";

export const GET_PROJECT = gql(`
  query GetProject($projectId: ID!) {
    node(id: $projectId, type: PROJECT) {
      id
      ... on Project {
        ...ProjectFragment
        scene {
          id
          alias
        }
      }
    }
  }
`);

export const GET_PROJECTS = gql(`
  query GetProjects($workspaceId: ID!, $pagination: Pagination, $keyword: String, $sort: ProjectSort) {
    projects(workspaceId: $workspaceId, pagination: $pagination, keyword: $keyword, sort: $sort) {
      edges {
        node {
          id
          ...ProjectFragment
          scene {
            id
            alias
          }
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
  query CheckProjectAlias($alias: String!, $workspaceId: ID!, $projectId: ID) {
    checkProjectAlias(alias: $alias, workspaceId:$workspaceId, projectId: $projectId) {
      alias
      available
    }
  }
`);

export const CREATE_PROJECT = gql(`
  mutation CreateProject(
    $workspaceId: ID!
    $visualizer: Visualizer!
    $name: String!
    $description: String!
    $coreSupport: Boolean
    $visibility: String
    $projectAlias: String
    $readme: String
    $license: String
    $topics: String
  ) {
    createProject(
      input: {
        workspaceId: $workspaceId
        visualizer: $visualizer
        name: $name
        description: $description
        coreSupport: $coreSupport
        visibility: $visibility
	      projectAlias: $projectAlias
        readme: $readme
        license: $license
        topics: $topics
      }
    ) {
      project {
        id
        name
        description
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
    $projectAlias: String
    $visibility: String
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
        projectAlias: $projectAlias
        visibility: $visibility
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
  query GetStarredProjects($workspaceId: ID!) {
    starredProjects(workspaceId: $workspaceId) {
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

export const GET_DELETED_PROJECTS = gql(`
  query GetDeletedProjects($workspaceId: ID!) {
    deletedProjects(workspaceId: $workspaceId) {
			nodes {
				id
				name
				isDeleted
        imageUrl
        visibility
        starred
			}
			totalCount
		}
  }
`);

export const UPDATE_PROJECT_METADATA = gql(`
  mutation UpdateProjectMetadata(
    $project: ID!
    $readme: String
    $license: String
    $topics: String
  ) {
    updateProjectMetadata(
      input: {
        project: $project
        readme: $readme
        license: $license
        topics: $topics
      }
    ) {
      metadata {
        id
      ...ProjectMetadataFragment
      }
    }
  }
`);
