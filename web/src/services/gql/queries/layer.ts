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

export const UPDATE_NLSLAYERS = gql(`
  mutation UpdateNLSLayers($input: UpdateNLSLayersInput!) {
    updateNLSLayers(input: $input) {
      layers {
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

export const UPDATE_CUSTOM_PROPERTY_SCHEMA = gql(`
  mutation UpdateCustomProperties($input: UpdateCustomPropertySchemaInput!) {
    updateCustomProperties(input: $input) {
      layer {
        id
      }
    }
  }
`);

export const CHANGE_CUSTOM_PROPERTY_TITLE = gql(`
  mutation ChangeCustomPropertyTitle($input: ChangeCustomPropertyTitleInput!) {
    changeCustomPropertyTitle(input: $input) {
      layer {
        id
      }
    }
  }
`);

export const REMOVE_CUSTOM_PROPERTY = gql(`
  mutation RemoveCustomProperty($input: RemoveCustomPropertyInput!) {
    removeCustomProperty(input: $input) {
      layer {
        id
      }
    }
  }
`);
