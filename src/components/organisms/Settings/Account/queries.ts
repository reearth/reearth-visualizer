import { gql } from "@apollo/client";

export const UPDATE_ME = gql`
  mutation updateMe(
    $name: String
    $email: String
    $lang: Lang
    $password: String
    $passwordConfirmation: String
  ) {
    updateMe(
      input: {
        name: $name
        email: $email
        lang: $lang
        password: $password
        passwordConfirmation: $passwordConfirmation
      }
    ) {
      user {
        id
        name
        email
        lang
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
      myTeam {
        id
        name
      }
      auths
    }
  }
`;
