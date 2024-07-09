import { gql } from "@apollo/client";

export const GET_TEAMS = gql`
  fragment Team on Team {
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
      datasetSchemaCount
      datasetCount
    }
  }

  query GetTeams {
    me {
      id
      name
      myTeam {
        id
        ...Team
      }
      teams {
        id
        ...Team
      }
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($name: String!) {
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
          datasetSchemaCount
          datasetCount
        }
      }
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation DeleteTeam($teamId: ID!) {
    deleteTeam(input: { teamId: $teamId }) {
      teamId
    }
  }
`;

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($teamId: ID!, $name: String!) {
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
          datasetSchemaCount
          datasetCount
        }
      }
    }
  }
`;

export const ADD_MEMBER_TO_TEAM = gql`
  mutation AddMemberToTeam($teamId: ID!, $userId: ID!, $role: Role!) {
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
          datasetSchemaCount
          datasetCount
        }
      }
    }
  }
`;

export const REMOVE_MEMBER_FROM_TEAM = gql`
  mutation RemoveMemberFromTeam($teamId: ID!, $userId: ID!) {
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
          datasetSchemaCount
          datasetCount
        }
      }
    }
  }
`;

export const UPDATE_MEMBER_OF_TEAM = gql`
  mutation UpdateMemberOfTeam($teamId: ID!, $userId: ID!, $role: Role!) {
    updateMemberOfTeam(input: { teamId: $teamId, userId: $userId, role: $role }) {
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
          datasetSchemaCount
          datasetCount
        }
      }
    }
  }
`;
