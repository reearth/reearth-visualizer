import { gql } from "@apollo/client";

export const GET_USER_BY_SEARCH = gql`
  query GetUserBySearch($nameOrEmail: String!) {
    searchUser(nameOrEmail: $nameOrEmail) {
      id
      name
      email
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      myTeam {
        id
        name
        projects(first: 100) {
          nodes {
            id
            publishmentStatus
            isArchived
            name
            imageUrl
            description
            visualizer
            scene {
              id
            }
          }
        }
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
      teams {
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
        projects(first: 100) {
          nodes {
            id
            publishmentStatus
            isArchived
            name
            imageUrl
            description
            visualizer
            scene {
              id
            }
          }
        }
      }
      auths
    }
  }
`;

export const GET_PROFILE = gql`
  query GetProfile {
    me {
      id
      name
      email
      lang
      theme
      myTeam {
        id
        name
      }
      auths
    }
  }
`;

export const GET_LANGUAGE = gql`
  query GetLanguage {
    me {
      id
      lang
    }
  }
`;

export const GET_THEME = gql`
  query GetTheme {
    me {
      id
      theme
    }
  }
`;

export const UPDATE_ME = gql`
  mutation UpdateMe(
    $name: String
    $email: String
    $lang: Lang
    $theme: Theme
    $password: String
    $passwordConfirmation: String
  ) {
    updateMe(
      input: {
        name: $name
        email: $email
        lang: $lang
        theme: $theme
        password: $password
        passwordConfirmation: $passwordConfirmation
      }
    ) {
      me {
        id
        name
        email
        lang
        theme
        myTeam {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_ME = gql`
  mutation DeleteMe($userId: ID!) {
    deleteMe(input: { userId: $userId }) {
      userId
    }
  }
`;
