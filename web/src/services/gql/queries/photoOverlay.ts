import { gql } from "@reearth/services/gql/__gen__";

export const CREATE_NLSPHOTOOVERLAY = gql(`
  mutation CreateNLSPhotoOverlay($input: CreateNLSPhotoOverlayInput!) {
    createNLSPhotoOverlay(input: $input) {
      layer {
        id
      }
    }
  }
`);
