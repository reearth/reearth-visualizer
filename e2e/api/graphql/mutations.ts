export const CREATE_PROJECT = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      project { id name description alias }
    }
  }
`;

export const CREATE_SCENE = `
  mutation CreateScene($input: CreateSceneInput!) {
    createScene(input: $input) {
      scene { id }
    }
  }
`;

export const UPDATE_PROJECT = `
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      project { id name description starred isDeleted }
    }
  }
`;

export const DELETE_PROJECT = `
  mutation DeleteProject($input: DeleteProjectInput!) {
    deleteProject(input: $input) { projectId }
  }
`;

export const CREATE_WORKSPACE = `
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      workspace { id name personal members { userId role } }
    }
  }
`;

export const UPDATE_WORKSPACE = `
  mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
    updateWorkspace(input: $input) {
      workspace { id name members { userId role } }
    }
  }
`;

export const DELETE_WORKSPACE = `
  mutation DeleteWorkspace($input: DeleteWorkspaceInput!) {
    deleteWorkspace(input: $input) { workspaceId }
  }
`;

export const ADD_MEMBER_TO_WORKSPACE = `
  mutation AddMemberToWorkspace($input: AddMemberToWorkspaceInput!) {
    addMemberToWorkspace(input: $input) {
      workspace { id members { userId role } }
    }
  }
`;

export const REMOVE_MEMBER_FROM_WORKSPACE = `
  mutation RemoveMemberFromWorkspace($input: RemoveMemberFromWorkspaceInput!) {
    removeMemberFromWorkspace(input: $input) {
      workspace { id members { userId role } }
    }
  }
`;

export const UPDATE_MEMBER_OF_WORKSPACE = `
  mutation UpdateMemberOfWorkspace($input: UpdateMemberOfWorkspaceInput!) {
    updateMemberOfWorkspace(input: $input) {
      workspace { id members { userId role } }
    }
  }
`;
