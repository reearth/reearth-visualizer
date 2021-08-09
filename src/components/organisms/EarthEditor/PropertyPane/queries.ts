import { gql } from "@apollo/client";

import { propertyFragment, infoboxFragment, layerFragment } from "@reearth/gql/fragments";

// Mutations

export const CHANGE_PROPERTY_VALUE = gql`
  mutation ChangePropertyValue(
    $value: Any
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
    $type: ValueType!
  ) {
    updatePropertyValue(
      input: {
        propertyId: $propertyId
        schemaItemId: $schemaItemId
        itemId: $itemId
        fieldId: $fieldId
        value: $value
        type: $type
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const LINK_DATASET = gql`
  mutation LinkDataset(
    $propertyId: ID!
    $itemId: ID
    $schemaItemId: PropertySchemaFieldID
    $fieldId: PropertySchemaFieldID!
    $datasetSchemaIds: [ID!]!
    $datasetIds: [ID!]
    $datasetFieldIds: [ID!]!
  ) {
    linkDatasetToPropertyValue(
      input: {
        propertyId: $propertyId
        itemId: $itemId
        schemaItemId: $schemaItemId
        fieldId: $fieldId
        datasetSchemaIds: $datasetSchemaIds
        datasetIds: $datasetIds
        datasetSchemaFieldIds: $datasetFieldIds
      }
    ) {
      property {
        id
        ...PropertyFragment
      }
    }
  }
`;

export const UNLINK_DATASET = gql`
  mutation UnlinkDataset(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
  ) {
    unlinkPropertyValue(
      input: {
        propertyId: $propertyId
        schemaItemId: $schemaItemId
        itemId: $itemId
        fieldId: $fieldId
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const CREATE_INFOBOX = gql`
  mutation createInfobox($layerId: ID!) {
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
  mutation removeInfobox($layerId: ID!) {
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

export const UPLOAD_FILE_TO_PROPERTY = gql`
  mutation UploadFileToProperty(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
    $file: Upload!
  ) {
    uploadFileToProperty(
      input: {
        propertyId: $propertyId
        schemaItemId: $schemaItemId
        itemId: $itemId
        fieldId: $fieldId
        file: $file
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const REMOVE_FIELD = gql`
  mutation RemovePropertyField(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
  ) {
    removePropertyField(
      input: {
        propertyId: $propertyId
        schemaItemId: $schemaItemId
        itemId: $itemId
        fieldId: $fieldId
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const ADD_PROPERTY_ITEM = gql`
  mutation addPropertyItem(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID!
    $index: Int
    $nameFieldValue: Any
    $nameFieldType: ValueType
  ) {
    addPropertyItem(
      input: {
        propertyId: $propertyId
        schemaItemId: $schemaItemId
        index: $index
        nameFieldValue: $nameFieldValue
        nameFieldType: $nameFieldType
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const MOVE_PROPERTY_ITEM = gql`
  mutation movePropertyItem(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID!
    $itemId: ID!
    $index: Int!
  ) {
    movePropertyItem(
      input: {
        propertyId: $propertyId
        schemaItemId: $schemaItemId
        itemId: $itemId
        index: $index
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const REMOVE_PROPERTY_ITEM = gql`
  mutation removePropertyItem(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID!
    $itemId: ID!
  ) {
    removePropertyItem(
      input: { propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const UPDATE_PROPERTY_ITEMS = gql`
  mutation updatePropertyItems(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID!
    $operations: [UpdatePropertyItemOperationInput!]!
  ) {
    updatePropertyItems(
      input: { propertyId: $propertyId, schemaItemId: $schemaItemId, operations: $operations }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

// Queries

export const GET_LAYER_PROPERTY = gql`
  query GetLayerProperty($layerId: ID!) {
    layer(id: $layerId) {
      id
      ...Layer1Fragment
    }
  }

  ${propertyFragment}
`;

export const GET_SCENE_PROPERTY = gql`
  query GetSceneProperty($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        property {
          id
          ...PropertyFragment
        }
        widgets {
          id
          pluginId
          extensionId
          enabled
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
      }
    }
  }

  ${propertyFragment}
`;

export const GET_LINKABLE_DATASETS = gql`
  query GetLinkableDatasets($sceneId: ID!) {
    datasetSchemas(sceneId: $sceneId, first: 100) {
      nodes {
        id
        source
        name
        fields {
          id
          name
          type
        }
        datasets(first: 100) {
          totalCount
          nodes {
            id
            name
            fields {
              fieldId
              type
            }
          }
        }
      }
    }
  }

  ${layerFragment}
`;

export const ADD_WIDGET = gql`
  mutation addWidget($sceneId: ID!, $pluginId: PluginID!, $extensionId: PluginExtensionID!) {
    addWidget(input: { sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId }) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
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

export const REMOVE_WIDGET = gql`
  mutation removeWidget($sceneId: ID!, $pluginId: PluginID!, $extensionId: PluginExtensionID!) {
    removeWidget(input: { sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId }) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
        }
      }
    }
  }
`;

export const UPDATE_WIDGET = gql`
  mutation updateWidget(
    $sceneId: ID!
    $pluginId: PluginID!
    $extensionId: PluginExtensionID!
    $enabled: Boolean
  ) {
    updateWidget(
      input: {
        sceneId: $sceneId
        pluginId: $pluginId
        extensionId: $extensionId
        enabled: $enabled
      }
    ) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
        }
      }
    }
  }
`;
