import { gql } from "@reearth/services/gql/__gen__";

export const ADD_GEOJSON_FEATURE = gql(`
  mutation AddGeoJSONFeature($input: AddGeoJSONFeatureInput!) {
    addGeoJSONFeature(input: $input) {
      id
      type
      properties
      geometry {
        ... on Point {
          type
          pointCoordinates
        }
        ... on LineString {
          type
          lineStringCoordinates
        }
        ... on Polygon {
          type
          polygonCoordinates
        }
        ... on MultiPolygon {
          type
          multiPolygonCoordinates
        }
        ... on GeometryCollection {
          type
          geometries {
            ... on Point {
              type
              pointCoordinates
            }
            ... on LineString {
              type
              lineStringCoordinates
            }
            ... on Polygon {
              type
              polygonCoordinates
            }
            ... on MultiPolygon {
              type
              multiPolygonCoordinates
            }
          }
        }
      }
    }
  }
`);
