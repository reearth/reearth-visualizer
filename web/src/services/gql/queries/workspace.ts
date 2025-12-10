import { gql } from "@reearth/services/gql/__gen__";

export const CREATE_WORKSPACE = gql(`
  mutation CreateWorkspace($name: String!) {
    createWorkspace(input: { name: $name }) {
      workspace {
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
        personal
      }
    }
  }
`);

export const DELETE_WORKSPACE = gql(`
  mutation DeleteWorkspace($workspaceId: ID!) {
    deleteWorkspace(input: { workspaceId: $workspaceId }) {
      workspaceId
    }
  }
`);

export const UPDATE_WORKSPACE = gql(`
  mutation UpdateWorkspace($workspaceId: ID!, $name: String!) {
    updateWorkspace(input: { workspaceId: $workspaceId, name: $name }) {
      workspace {
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
        personal
      }
    }
  }
`);

export const ADD_MEMBER_TO_WORKSPACE = gql(`
  mutation AddMemberToWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
    addMemberToWorkspace(input: { workspaceId: $workspaceId, userId: $userId, role: $role }) {
      workspace {
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
        personal
      }
    }
  }
`);

export const REMOVE_MEMBER_FROM_WORKSPACE = gql(`
  mutation RemoveMemberFromWorkspace($workspaceId: ID!, $userId: ID!) {
    removeMemberFromWorkspace(input: { workspaceId: $workspaceId, userId: $userId }) {
      workspace {
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
        personal
      }
    }
  }
`);

export const UPDATE_MEMBER_OF_WORKSPACE = gql(`
  mutation UpdateMemberOfWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
    updateMemberOfWorkspace(
      input: { workspaceId: $workspaceId, userId: $userId, role: $role }
    ) {
      workspace {
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
        personal
      }
    }
  }
`);

export const WORKSPACE_POLICY_CHECK = gql(`
  query WorkspacePolicyCheck($workspaceId: ID!) {
    workspacePolicyCheck(input: { workspaceId: $workspaceId }) {
      workspaceId
      enableToCreatePrivateProject
      disableOperationByOverUsedSeat
    }
  }
`);
