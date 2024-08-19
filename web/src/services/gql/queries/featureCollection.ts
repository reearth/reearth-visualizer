import { gql } from "@reearth/services/gql/__gen__";

export const ADD_GEOJSON_FEATURE = gql(`
  mutation AddGeoJSONFeature($input: AddGeoJSONFeatureInput!) {
    addGeoJSONFeature(input: $input) {
      id
		  type
		  properties
    }
  }
`);

export const UPDATE_GEOJSON_FEATURE = gql(`
  mutation UpdateGeoJSONFeature($input: UpdateGeoJSONFeatureInput!) {
    updateGeoJSONFeature(input: $input) {
      id
		  type
		  properties
    }
  }
`);

export const DELETE_GEOJSON_FEATURE = gql(`
  mutation DeleteGeoJSONFeature($input: DeleteGeoJSONFeatureInput!){
    deleteGeoJSONFeature(input: $input) {
		  deletedFeatureId
    }
  }
`);
