import { gql } from "@apollo/client";

import { layerFragment } from "@reearth/gql/fragments";

export const SCENE = gql`
  query Scene($projectId: ID!) {
    scene(projectId: $projectId) {
      id
      projectId
      teamId
    }
  }
`;

export const GET_SCENE = gql`
  query getScene($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        rootLayerId
      }
    }
  }
`;

export const CREATE_SCENE = gql`
  mutation CreateScene($projectId: ID!) {
    createScene(input: { projectId: $projectId }) {
      scene {
        id
      }
    }
  }
`;

export const GET_PRIMITIVES = gql`
  query GetPrimitives($sceneId: ID!, $lang: Lang) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        plugins {
          plugin {
            id
            extensions {
              extensionId
              translatedDescription(lang: $lang)
              translatedName(lang: $lang)
              icon
              type
            }
          }
        }
      }
    }
  }
`;

export const ADD_LAYER_ITEM_FROM_PRIMITIVE = gql`
  mutation addLayerItemFromPrimitive(
    $parentLayerId: ID!
    $pluginId: ID!
    $extensionId: ID!
    $name: String
    $lat: Float
    $lng: Float
    $index: Int
    $lang: Lang
  ) {
    addLayerItem(
      input: {
        parentLayerId: $parentLayerId
        pluginId: $pluginId
        extensionId: $extensionId
        name: $name
        lat: $lat
        lng: $lng
        index: $index
      }
    ) {
      parentLayer {
        id
        ...Layer3Fragment
      }
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;
