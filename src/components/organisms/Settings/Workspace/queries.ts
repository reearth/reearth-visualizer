import { gql } from "@apollo/client";

export const UPDATE_TEAM = gql`
  mutation updateTeam($teamId: ID!, $name: String!) {
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
      }
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation deleteTeam($teamId: ID!) {
    deleteTeam(input: { teamId: $teamId }) {
      teamId
    }
  }
`;

export const SEARCH_USER = gql`
  query searchUser($nameOrEmail: String!) {
    searchUser(nameOrEmail: $nameOrEmail) {
      id
      name
      email
    }
  }
`;

export const ADD_MEMBER_TO_TEAM = gql`
  mutation addMemberToTeam($teamId: ID!, $userId: ID!, $role: Role!) {
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
      }
    }
  }
`;

export const UPDATE_MEMBER_OF_TEAM = gql`
  mutation updateMemberOfTeam($teamId: ID!, $userId: ID!, $role: Role!) {
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
      }
    }
  }
`;

export const REMOVE_MEMBER_FROM_TEAM = gql`
  mutation removeMemberFromTeam($teamId: ID!, $userId: ID!) {
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
      }
    }
  }
`;
