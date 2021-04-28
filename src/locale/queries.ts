import { gql } from "@apollo/client";

export const LANGUAGE = gql`
  query Language {
    me {
      id
      lang
    }
  }
`;
