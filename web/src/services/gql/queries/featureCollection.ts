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
