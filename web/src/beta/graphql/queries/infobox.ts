import { gql } from "@apollo/client";

import { layerFragment, infoboxFragment } from "../fragments";

export const GET_BLOCKS = gql`
  query GetBlocks($sceneId: ID!, $lang: Lang) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        plugins {
          plugin {
            id
            extensions {
              extensionId
              type
              name
              description
              translatedName(lang: $lang)
              translatedDescription(lang: $lang)
              icon
            }
          }
        }
      }
    }
  }
`;

export const CREATE_INFOBOX = gql`
  mutation CreateInfobox($layerId: ID!, $lang: Lang) {
    createInfobox(input: { layerId: $layerId }) {
      layer {
        id
        infobox {
          ...InfoboxFragment
        }
      }
    }
  }

  ${infoboxFragment}
`;

export const REMOVE_INFOBOX = gql`
  mutation RemoveInfobox($layerId: ID!, $lang: Lang) {
    removeInfobox(input: { layerId: $layerId }) {
      layer {
        id
        infobox {
          ...InfoboxFragment
        }
      }
    }
  }

  ${infoboxFragment}
`;

export const ADD_INFOBOX_FIELD = gql`
  mutation AddInfoboxField(
    $layerId: ID!
    $pluginId: ID!
    $extensionId: ID!
    $index: Int
    $lang: Lang
  ) {
    addInfoboxField(
      input: { layerId: $layerId, pluginId: $pluginId, extensionId: $extensionId, index: $index }
    ) {
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;

export const REMOVE_INFOBOX_FIELD = gql`
  mutation RemoveInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $lang: Lang) {
    removeInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId }) {
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;

export const MOVE_INFOBOX_FIELD = gql`
  mutation MoveInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $index: Int!, $lang: Lang) {
    moveInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId, index: $index }) {
      layer {
        id
        ...EarthLayer
      }
    }
  }

  ${layerFragment}
`;
