export const GET_ME = `
  query {
    me { id name email myWorkspaceId }
  }
`;

export const GET_PROJECTS = `
  query GetProjects($workspaceId: ID!, $pagination: Pagination, $keyword: String, $sort: ProjectSort) {
    projects(workspaceId: $workspaceId, pagination: $pagination, keyword: $keyword, sort: $sort) {
      totalCount
      nodes { id name description alias starred updatedAt }
    }
  }
`;

export const GET_PROJECT = `
  query GetProject($projectId: ID!) {
    node(id: $projectId, type: PROJECT) {
      id
      ... on Project { name description alias coreSupport starred }
    }
  }
`;

export const GET_WORKSPACE = `
  query GetWorkspace($workspaceId: ID!) {
    node(id: $workspaceId, type: WORKSPACE) {
      id
      ... on Workspace { name personal members { userId role } }
    }
  }
`;

export const SEARCH_USER = `
  query SearchUser($nameOrEmail: String!) {
    searchUser(nameOrEmail: $nameOrEmail) { id name email }
  }
`;

export const WORKSPACE_POLICY_CHECK = `
  query WorkspacePolicyCheck($input: PolicyCheckInput!) {
    workspacePolicyCheck(input: $input) {
      workspaceId
      enableToCreatePrivateProject
      enableCustomDomainCreation
      overCustomDomainCount
      disableOperationByOverUsedSeat
    }
  }
`;

export const GET_ASSETS = `
  query GetAssets($workspaceId: ID!, $projectId: ID, $pagination: Pagination, $keyword: String, $sort: AssetSort) {
    assets(workspaceId: $workspaceId, projectId: $projectId, pagination: $pagination, keyword: $keyword, sort: $sort) {
      totalCount
      nodes {
        id
        workspaceId
        projectId
        name
        size
        url
        contentType
        coreSupport
        createdAt
      }
    }
  }
`;

export const CHECK_STORY_ALIAS = `
  query CheckStoryAlias($alias: String!, $storyId: ID) {
    checkStoryAlias(alias: $alias, storyId: $storyId) {
      alias
      available
    }
  }
`;

export const CHECK_PROJECT_ALIAS = `
  query CheckProjectAlias($alias: String!, $workspaceId: ID!, $projectId: ID) {
    checkProjectAlias(alias: $alias, workspaceId: $workspaceId, projectId: $projectId) {
      alias
      available
    }
  }
`;

export const CHECK_SCENE_ALIAS = `
  query CheckSceneAlias($alias: String!, $projectId: ID) {
    checkSceneAlias(alias: $alias, projectId: $projectId) {
      alias
      available
    }
  }
`;

export const GET_STARRED_PROJECTS = `
  query GetStarredProjects($workspaceId: ID!) {
    starredProjects(workspaceId: $workspaceId) {
      totalCount
      nodes { id name starred }
    }
  }
`;

export const GET_DELETED_PROJECTS = `
  query GetDeletedProjects($workspaceId: ID!) {
    deletedProjects(workspaceId: $workspaceId) {
      totalCount
      nodes { id name isDeleted }
    }
  }
`;

export const GET_PROPERTY_SCHEMA = `
  query GetPropertySchema($id: ID!) {
    propertySchema(id: $id) {
      id
      groups {
        schemaGroupId
        schemaId
        isList
        title
        fields { fieldId type title description }
      }
    }
  }
`;

export const GET_PROPERTY_SCHEMAS = `
  query GetPropertySchemas($id: [ID!]!) {
    propertySchemas(id: $id) {
      id
      groups {
        schemaGroupId
        schemaId
        isList
        fields { fieldId type title }
      }
    }
  }
`;

export const GET_SCENE_WIDGETS = `
  query GetSceneWidgets($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        widgets { id pluginId extensionId enabled extended propertyId }
      }
    }
  }
`;

export const GET_SCENE = `
  query GetScene($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        projectId
        property {
          id
          items {
            ... on PropertyGroupList {
              id
              schemaGroupId
              groups {
                id
                schemaGroupId
                fields { id fieldId type value }
              }
            }
            ... on PropertyGroup {
              id
              schemaGroupId
              fields { id fieldId type value }
            }
          }
        }
        stories { id alias publishmentStatus }
      }
    }
  }
`;