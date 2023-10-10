import { gql } from "@reearth/services/gql/__gen__";

export const ADD_APPEARANCE = gql(`
  mutation AddStyle($input: AddStyleInput!) {
    addStyle(input: $input) {
      style {
        id
        name
      }
    }
  }
`);

export const UPDATE_APPEARANCE = gql(`
  mutation UpdateStyle($input: UpdateStyleInput!) {
    updateStyle(input: $input) {
      style {
        id
        name
      }
    }
  }
`);

export const REMOVE_APPEARANCE = gql(`
  mutation RemoveStyle($input: RemoveStyleInput!) {
    removeStyle(input: $input) {
      styleId
    }
  }
`);
