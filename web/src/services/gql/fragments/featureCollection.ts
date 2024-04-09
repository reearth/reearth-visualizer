import { gql } from "@apollo/client";

const featureFragment = gql`
  fragment FeatureFragment on Feature {
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
`;

export default featureFragment;
