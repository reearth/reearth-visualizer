import { gql } from "@reearth/services/gql/__gen__";

export const CREATE_WORKSPACE = gql(`
  mutation CreateWorkspace($name: String!) {
    createTeam(input: { name: $name }) {
      team {
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
        policyId
        policy {
          id
          name
          projectCount
          memberCount
          publishedProjectCount
          layerCount
          assetStorageSize
        }
      }
    }
  }
`);

export const DELETE_WORKSPACE = gql(`
  mutation DeleteWorkspace($teamId: ID!) {
    deleteTeam(input: { teamId: $teamId }) {
      teamId
    }
  }
`);

export const UPDATE_WORKSPACE = gql(`
  mutation UpdateWorkspace($teamId: ID!, $name: String!) {
    updateTeam(input: { teamId: $teamId, name: $name }) {
      team {
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
        policyId
        policy {
          id
          name
          projectCount
          memberCount
          publishedProjectCount
          layerCount
          assetStorageSize
        }
      }
    }
  }
`);

export const ADD_MEMBER_TO_WORKSPACE = gql(`
  mutation AddMemberToWorkspace($teamId: ID!, $userId: ID!, $role: Role!) {
    addMemberToTeam(input: { teamId: $teamId, userId: $userId, role: $role }) {
      team {
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
        policyId
        policy {
          id
          name
          projectCount
          memberCount
          publishedProjectCount
          layerCount
          assetStorageSize
        }
      }
    }
  }
`);

export const REMOVE_MEMBER_FROM_WORKSPACE = gql(`
  mutation RemoveMemberFromWorkspace($teamId: ID!, $userId: ID!) {
    removeMemberFromTeam(input: { teamId: $teamId, userId: $userId }) {
      team {
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
        policyId
        policy {
          id
          name
          projectCount
          memberCount
          publishedProjectCount
          layerCount
          assetStorageSize
        }
      }
    }
  }
`);

export const UPDATE_MEMBER_OF_WORKSPACE = gql(`
  mutation UpdateMemberOfWorkspace($teamId: ID!, $userId: ID!, $role: Role!) {
    updateMemberOfTeam(
      input: { teamId: $teamId, userId: $userId, role: $role }
    ) {
      team {
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
        policyId
        policy {
          id
          name
          projectCount
          memberCount
          publishedProjectCount
          layerCount
          assetStorageSize
        }
      }
    }
  }
`);
