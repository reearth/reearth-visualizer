import { gql } from "@reearth/services/gql/__gen__";

export const ADD_NLSLAYERSIMPLE = gql(`
  mutation AddNLSLayerSimple($input: AddNLSLayerSimpleInput!) {
    addNLSLayerSimple(input: $input) {
      layers {
        id
      }
    }
  }
`);

export const UPDATE_NLSLAYER = gql(`
  mutation UpdateNLSLayer($input: UpdateNLSLayerInput!) {
    updateNLSLayer(input: $input) {
      layer {
        id
      }
    }
  }
`);

export const REMOVE_NLSLAYER = gql(`
  mutation RemoveNLSLayer($input: RemoveNLSLayerInput!) {
    removeNLSLayer(input: $input) {
      layerId
    }
  }
`);
