import { gql } from "@apollo/client";

import { layerFragment } from "@reearth/gql/fragments";

export const GET_PRIMITIVES = gql`
  query GetPrimitives($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        plugins {
          plugin {
            id
            extensions {
              extensionId
              translatedDescription
              translatedName
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
    $pluginId: PluginID!
    $extensionId: PluginExtensionID!
    $name: String
    $lat: Float
    $lng: Float
    $index: Int
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
