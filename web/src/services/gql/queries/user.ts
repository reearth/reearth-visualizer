import { gql } from "@reearth/services/gql/__gen__";

export const GET_USER_BY_SEARCH = gql(`
  query GetUserBySearch($nameOrEmail: String!) {
    searchUser(nameOrEmail: $nameOrEmail) {
      id
      name
      email
    }
  }
`);

export const GET_ME = gql(`
  query GetMe {
    me {
      id
      name
      email
      lang
      theme
      myWorkspace {
        id
        name
        alias
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
        enableToCreatePrivateProject
      }
      workspaces {
        id
        name
        alias
        personal
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
        }
      enableToCreatePrivateProject
      }
      auths
    }
  }
`);

export const UPDATE_ME = gql(`
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
        myWorkspace {
          id
          name
        }
      }
    }
  }
`);

export const DELETE_ME = gql(`
  mutation DeleteMe($userId: ID!) {
    deleteMe(input: { userId: $userId }) {
      userId
    }
  }
`);
