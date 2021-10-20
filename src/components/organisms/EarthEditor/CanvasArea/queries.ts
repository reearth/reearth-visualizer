/* eslint-disable graphql/template-strings */
import { gql } from "@apollo/client";

import { layerFragment, propertyFragment, widgetAlignSysFragment } from "@reearth/gql/fragments";

const fragments = gql`
  fragment EarthLayerItem on LayerItem {
    id
    linkedDatasetId
    scenePlugin {
      property {
        id
        ...PropertyFragment
      }
    }
    merged {
      parentId
      property {
        ...MergedPropertyFragmentWithoutSchema
      }
      infobox {
        property {
          ...MergedPropertyFragmentWithoutSchema
        }
        fields {
          originalId
          pluginId
          extensionId
          property {
            ...MergedPropertyFragmentWithoutSchema
          }
          scenePlugin {
            property {
              id
              ...PropertyFragment
            }
          }
        }
      }
    }
  }

  fragment EarthLayer on Layer {
    id
    name
    isVisible
    pluginId
    extensionId
    scenePlugin {
      property {
        id
        ...PropertyFragment
      }
    }
    propertyId
    property {
      id
      ...PropertyFragmentWithoutSchema
    }
    infobox {
      propertyId
      property {
        id
        ...PropertyFragmentWithoutSchema
      }
      fields {
        id
        pluginId
        extensionId
        propertyId
        scenePlugin {
          property {
            id
            ...PropertyFragment
          }
        }
        property {
          id
          ...PropertyFragmentWithoutSchema
        }
      }
    }
    ... on LayerGroup {
      linkedDatasetSchemaId
      layers {
        id
      }
    }
    ...EarthLayerItem
  }

  fragment EarthLayer1 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer
      }
    }
  }

  fragment EarthLayer2 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer1
      }
    }
  }

  fragment EarthLayer3 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer2
      }
    }
  }

  fragment EarthLayer4 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer3
      }
    }
  }

  fragment EarthLayer5 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer4
      }
    }
  }

  ${propertyFragment}
`;

export const GET_LAYERS = gql`
  query GetLayers($sceneId: ID!, $lang: String) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        rootLayer {
          id
          ...EarthLayer5
        }
      }
    }
  }

  ${fragments}
`;

export const GET_EARTH_WIDGETS = gql`
  query GetEarthWidgets($sceneId: ID!, $lang: String) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        project {
          id
          publicTitle
        }
        property {
          id
          ...PropertyFragment
        }
        plugins {
          property {
            id
            ...PropertyFragment
          }
          pluginId
          plugin {
            id
            extensions {
              extensionId
              type
              widgetLayout {
                floating
                extendable {
                  vertically
                  horizontally
                }
                extended
                defaultLocation {
                  zone
                  section
                  area
                }
              }
            }
          }
        }
        widgets {
          id
          enabled
          extended
          pluginId
          extensionId
          property {
            id
            ...PropertyFragment
          }
        }
        widgetAlignSystem {
          ...WidgetAlignSystemFragment
        }
      }
    }
  }

  ${fragments}
`;

export const UPDATE_WIDGET_ALIGN_SYSTEM = gql`
  mutation updateWidgetAlignSystem(
    $sceneId: ID!
    $location: WidgetLocationInput!
    $align: WidgetAreaAlign
  ) {
    updateWidgetAlignSystem(input: { sceneId: $sceneId, location: $location, align: $align }) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
        }
        widgetAlignSystem {
          ...WidgetAlignSystemFragment
        }
      }
    }
  }

  ${widgetAlignSysFragment}
`;

export const MOVE_INFOBOX_FIELD = gql`
  mutation moveInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $index: Int!, $lang: String) {
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
  mutation removeInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $lang: String) {
    removeInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId }) {
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;

export const GET_BLOCKS = gql`
  query getBlocks($sceneId: ID!, $lang: String) {
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

export const ADD_INFOBOX_FIELD = gql`
  mutation addInfoboxField(
    $layerId: ID!
    $pluginId: PluginID!
    $extensionId: PluginExtensionID!
    $index: Int
    $lang: String
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
