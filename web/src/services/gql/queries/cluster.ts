import { gql } from "@apollo/client";

import { propertyFragment } from "@reearth/gql/fragments";

export const GET_CLUSTERS = gql`
  query GetClusters($sceneId: ID!, $lang: Lang) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        clusters {
          id
          name
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
      }
    }
  }
`;

export const ADD_CLUSTER = gql`
  mutation AddCluster($sceneId: ID!, $name: String!, $lang: Lang) {
    addCluster(input: { sceneId: $sceneId, name: $name }) {
      cluster {
        id
        name
        propertyId
        property {
          id
          ...PropertyFragment
        }
      }
    }
  }

  ${propertyFragment}
`;

export const REMOVE_CLUSTER = gql`
  mutation RemoveCluster($sceneId: ID!, $clusterId: ID!) {
    removeCluster(input: { sceneId: $sceneId, clusterId: $clusterId }) {
      scene {
        id
        clusters {
          id
          name
          propertyId
        }
      }
    }
  }
`;

export const UPDATE_CLUSTER = gql`
  mutation UpdateCluster($sceneId: ID!, $clusterId: ID!, $name: String!) {
    updateCluster(input: { sceneId: $sceneId, clusterId: $clusterId, name: $name }) {
      cluster {
        id
        name
        propertyId
      }
    }
  }
`;
