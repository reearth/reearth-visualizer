import { gql } from "@reearth/services/gql/__gen__";

export const ADD_LAYERSTYLE = gql(`
  mutation AddStyle($input: AddStyleInput!) {
    addStyle(input: $input) {
      style {
        id
        name
      }
    }
  }
`);

export const UPDATE_LAYERSTYLE = gql(`
  mutation UpdateStyle($input: UpdateStyleInput!) {
    updateStyle(input: $input) {
      style {
        id
        name
      }
    }
  }
`);

export const REMOVE_LAYERSTYLE = gql(`
  mutation RemoveStyle($input: RemoveStyleInput!) {
    removeStyle(input: $input) {
      styleId
    }
  }
`);
