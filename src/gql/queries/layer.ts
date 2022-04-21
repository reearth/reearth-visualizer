import { gql } from "@apollo/client";

import { EarthLayerFragments, LayerSystemFragments, layerFragment } from "../fragments";

export const GET_LAYERS_FROM_ID = gql`
  query GetLayersFromLayerId($layerId: ID!) {
    layer(id: $layerId) {
      id
      ...LayerSystemLayer5
    }
  }

  ${LayerSystemFragments}
`;

export const GET_LAYERS_FROM_SCENE_ID = gql`
  query GetLayers($sceneId: ID!, $lang: Lang) {
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

  ${EarthLayerFragments}
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
  ${LayerSystemFragments}
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
  ${LayerSystemFragments}
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
  ${LayerSystemFragments}
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

  ${LayerSystemFragments}
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

  ${LayerSystemFragments}
`;

export const ADD_LAYER_GROUP_FROM_DATASET_SCHEMA = gql`
  mutation addLayerGroupFromDatasetSchema(
    $parentLayerId: ID!
    $pluginId: ID
    $extensionId: ID
    $datasetSchemaId: ID
    $lang: Lang
  ) {
    addLayerGroup(
      input: {
        parentLayerId: $parentLayerId
        pluginId: $pluginId
        extensionId: $extensionId
        linkedDatasetSchemaID: $datasetSchemaId
      }
    ) {
      layer {
        id
        ...Layer1Fragment
      }
      parentLayer {
        id
        ...Layer0Fragment
      }
    }
  }
  ${layerFragment}
`;
