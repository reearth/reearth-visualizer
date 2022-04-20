import { gql } from "@apollo/client";

import {
  propertyFragment,
  infoboxFragment,
  layerFragment,
  widgetAlignSysFragment,
} from "@reearth/gql/fragments";

// Mutations

export const CHANGE_PROPERTY_VALUE = gql`
  mutation ChangePropertyValue(
    $value: Any
    $propertyId: ID!
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
    $type: ValueType!
    $lang: Lang
  ) {
    updatePropertyValue(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
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
    $schemaGroupId: ID
    $fieldId: ID!
    $datasetSchemaIds: [ID!]!
    $datasetIds: [ID!]
    $datasetFieldIds: [ID!]!
    $lang: Lang
  ) {
    linkDatasetToPropertyValue(
      input: {
        propertyId: $propertyId
        itemId: $itemId
        schemaGroupId: $schemaGroupId
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
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
    $lang: Lang
  ) {
    unlinkPropertyValue(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
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

export const UPLOAD_FILE_TO_PROPERTY = gql`
  mutation UploadFileToProperty(
    $propertyId: ID!
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
    $file: Upload!
    $lang: Lang
  ) {
    uploadFileToProperty(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
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
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
    $lang: Lang
  ) {
    removePropertyField(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
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
    $schemaGroupId: ID!
    $index: Int
    $nameFieldValue: Any
    $nameFieldType: ValueType
    $lang: Lang
  ) {
    addPropertyItem(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
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
    $schemaGroupId: ID!
    $itemId: ID!
    $index: Int!
    $lang: Lang
  ) {
    movePropertyItem(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
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
  mutation removePropertyItem($propertyId: ID!, $schemaGroupId: ID!, $itemId: ID!, $lang: Lang) {
    removePropertyItem(
      input: { propertyId: $propertyId, schemaGroupId: $schemaGroupId, itemId: $itemId }
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
    $schemaGroupId: ID!
    $operations: [UpdatePropertyItemOperationInput!]!
    $lang: Lang
  ) {
    updatePropertyItems(
      input: { propertyId: $propertyId, schemaGroupId: $schemaGroupId, operations: $operations }
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
  query GetLayerProperty($layerId: ID!, $lang: Lang) {
    layer(id: $layerId) {
      id
      ...Layer1Fragment
    }
  }

  ${propertyFragment}
`;

export const GET_SCENE_PROPERTY = gql`
  query GetSceneProperty($sceneId: ID!, $lang: Lang) {
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
  mutation addWidget($sceneId: ID!, $pluginId: ID!, $extensionId: ID!, $lang: Lang) {
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
      sceneWidget {
        id
        enabled
        pluginId
        extensionId
      }
    }
  }
`;

export const REMOVE_WIDGET = gql`
  mutation removeWidget($sceneId: ID!, $widgetId: ID!) {
    removeWidget(input: { sceneId: $sceneId, widgetId: $widgetId }) {
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
    $widgetId: ID!
    $enabled: Boolean
    $location: WidgetLocationInput
    $extended: Boolean
    $index: Int
  ) {
    updateWidget(
      input: {
        sceneId: $sceneId
        widgetId: $widgetId
        enabled: $enabled
        location: $location
        extended: $extended
        index: $index
      }
    ) {
      scene {
        id
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

  ${widgetAlignSysFragment}
`;
