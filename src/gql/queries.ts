import { gql } from "@apollo/client";

export const DELETE_ME = gql`
  mutation deleteMe($userId: ID!) {
    deleteMe(input: { userId: $userId }) {
      userId
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation createTeam($name: String!) {
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
      }
    }
  }
`;
export const TEAMS = gql`
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
  }

  query teams {
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
