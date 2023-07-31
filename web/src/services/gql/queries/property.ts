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
