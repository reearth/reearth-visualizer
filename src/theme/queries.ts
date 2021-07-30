import { gql } from "@apollo/client";

export const THEME = gql`
  query Theme {
    me {
      id
      theme
    }
  }
`;
