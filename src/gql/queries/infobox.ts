import { gql } from "@apollo/client";

import { layerFragment, infoboxFragment } from "@reearth/gql/fragments";

export const GET_BLOCKS = gql`
  query getBlocks($sceneId: ID!, $lang: Lang) {
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
  mutation createInfobox($layerId: ID!, $lang: Lang) {
    createInfobox(input: { layerId: $layerId }) {
      layer {
        id
        infobox {
          ...InfoboxFragment
        }
        ... on LayerItem {
          merged {
            infobox {
              ...MergedInfoboxFragment
            }
          }
        }
      }
    }
  }

  ${infoboxFragment}
`;

export const REMOVE_INFOBOX = gql`
  mutation removeInfobox($layerId: ID!, $lang: Lang) {
    removeInfobox(input: { layerId: $layerId }) {
      layer {
        id
        infobox {
          ...InfoboxFragment
        }
        ... on LayerItem {
          merged {
            infobox {
              ...MergedInfoboxFragment
            }
          }
        }
      }
    }
  }

  ${infoboxFragment}
`;

export const ADD_INFOBOX_FIELD = gql`
  mutation addInfoboxField(
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

export const MOVE_INFOBOX_FIELD = gql`
  mutation moveInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $index: Int!, $lang: Lang) {
    moveInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId, index: $index }) {
      layer {
        id
        ...EarthLayer
      }
    }
  }

  ${layerFragment}
`;

export const REMOVE_INFOBOX_FIELD = gql`
  mutation removeInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $lang: Lang) {
    removeInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId }) {
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;
