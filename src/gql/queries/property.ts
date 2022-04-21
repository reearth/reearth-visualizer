import { gql } from "@apollo/client";

import { propertyFragment, layerFragment } from "@reearth/gql/fragments";

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
`;

export const CHANGE_PROPERTY_VALUE = gql`
  mutation ChangePropertyValue(
    $propertyId: ID!
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
    $value: Any
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
