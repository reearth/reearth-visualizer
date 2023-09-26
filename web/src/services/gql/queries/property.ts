import { gql } from "@reearth/services/gql/__gen__";

export const UPDATE_PROPERTY_VALUE = gql(`
  mutation UpdatePropertyValue(
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
`);

export const ADD_PROPERTY_ITEM = gql(`
  mutation AddPropertyItem(
    $propertyId: ID!
    $schemaGroupId: ID!
    $lang: Lang
  ) {
    addPropertyItem(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
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
`);

export const REMOVE_PROPERTY_ITEM = gql(`
  mutation RemovePropertyItem($propertyId: ID!, $schemaGroupId: ID!, $itemId: ID!, $lang: Lang) {
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
`);

export const MOVE_PROPERTY_ITEM = gql(`
  mutation MovePropertyItem(
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
`);
