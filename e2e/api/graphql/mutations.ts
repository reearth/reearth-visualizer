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
