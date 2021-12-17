import { gql } from "@apollo/client";

import { propertyFragment } from "@reearth/gql/fragments";

const fragments = gql`
  fragment LayerSystemLayer on Layer {
    id
    name
    isVisible
    pluginId
    extensionId
    ... on LayerGroup {
      linkedDatasetSchemaId
      layers {
        id
      }
    }
    ... on LayerItem {
      linkedDatasetId
    }
  }

  fragment LayerSystemLayer1 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer
      }
    }
  }

  fragment LayerSystemLayer2 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer1
      }
    }
  }

  fragment LayerSystemLayer3 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer2
      }
    }
  }

  fragment LayerSystemLayer4 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer3
      }
    }
  }

  fragment LayerSystemLayer5 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer4
      }
    }
  }
`;

export const GET_LAYERS = gql`
  query GetLayersFromLayerId($layerId: ID!) {
    layer(id: $layerId) {
      id
      ...LayerSystemLayer5
    }
  }

  ${fragments}
`;

export const MOVE_LAYER = gql`
  mutation moveLayer($layerId: ID!, $destLayerId: ID, $index: Int) {
    moveLayer(input: { layerId: $layerId, destLayerId: $destLayerId, index: $index }) {
      fromParentLayer {
        id
        ...LayerSystemLayer
      }
      toParentLayer {
        id
        ...LayerSystemLayer
      }
    }
  }
  ${fragments}
`;

export const UPDATE_LAYER = gql`
  mutation UpdateLayer($layerId: ID!, $name: String, $visible: Boolean) {
    updateLayer(input: { layerId: $layerId, name: $name, visible: $visible }) {
      layer {
        id
        ...LayerSystemLayer
      }
    }
  }
  ${fragments}
`;

export const REMOVE_LAYER = gql`
  mutation RemoveLayer($layerId: ID!) {
    removeLayer(input: { layerId: $layerId }) {
      layerId
      parentLayer {
        id
        ...LayerSystemLayer
      }
    }
  }
  ${fragments}
`;

export const IMPORT_LAYER = gql`
  mutation ImportLayer($layerId: ID!, $file: Upload!, $format: LayerEncodingFormat!) {
    importLayer(input: { layerId: $layerId, file: $file, format: $format }) {
      layers {
        id
        ...LayerSystemLayer5
      }
      parentLayer {
        id
        ...LayerSystemLayer
      }
    }
  }

  ${fragments}
`;

export const ADD_LAYER_GROUP = gql`
  mutation AddLayerGroup($parentLayerId: ID!, $index: Int, $name: String) {
    addLayerGroup(input: { parentLayerId: $parentLayerId, index: $index, name: $name }) {
      layer {
        id
        ...LayerSystemLayer5
      }
      parentLayer {
        id
        ...LayerSystemLayer
      }
    }
  }

  ${fragments}
`;

export const GET_WIDGETS = gql`
  query GetWidgets($sceneId: ID!, $lang: String) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        plugins {
          plugin {
            id
            extensions {
              extensionId
              description
              name
              translatedDescription(lang: $lang)
              translatedName(lang: $lang)
              icon
              singleOnly
              type
              widgetLayout {
                extendable {
                  vertically
                  horizontally
                }
                extended
                floating
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
          propertyId
        }
      }
    }
  }
`;

export const GET_CLUSTERS = gql`
  query GetClusters($sceneId: ID!, $lang: String) {
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
  mutation AddCluster($sceneId: ID!, $name: String!, $lang: String) {
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
  mutation removeCluster($sceneId: ID!, $clusterId: ID!) {
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
