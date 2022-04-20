import { gql } from "@apollo/client";

export const UPDATE_ME = gql`
  mutation updateMe(
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

export const PROFILE = gql`
  query Profile {
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
