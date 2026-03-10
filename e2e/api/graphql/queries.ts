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
