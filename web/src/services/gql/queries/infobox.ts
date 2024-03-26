import { gql } from "@reearth/services/gql/__gen__";

export const CREATE_NLSINFOBOX = gql(`
  mutation CreateNLSInfobox($input: CreateNLSInfoboxInput!) {
    createNLSInfobox(input: $input) {
      layer{
        id
      }
    }
  }
`);

export const REMOVE_NLSINFOBOX = gql(`
  mutation RemoveNLSInfobox($input: RemoveNLSInfoboxInput!) {
    removeNLSInfobox(input: $input) {
      layer {
        id
      }
    }
  }
`);

export const ADD_NLSINFOBOX_BLOCK = gql(`
  mutation AddNLSInfoboxBlock($input: AddNLSInfoboxBlockInput!) {
    addNLSInfoboxBlock(input: $input) {
      layer {
        id
      }
    }
  }
`);

export const MOVE_NLSINFOBOX_BLOCK = gql(`
  mutation MoveNLSInfoboxBlock($input: MoveNLSInfoboxBlockInput!) {
    moveNLSInfoboxBlock(input: $input) {
      index
      infoboxBlockId
      layer {
        id
      }
    }
  }
`);

export const REMOVE_NLSINFOBOX_BLOCK = gql(`
  mutation RemoveNLSInfoboxBlock($input: RemoveNLSInfoboxBlockInput!) {
    removeNLSInfoboxBlock(input: $input) {
      infoboxBlockId
      layer {
        id
      }
    }
  }
`);
