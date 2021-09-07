import { gql } from "@apollo/client";

const propertyFragment = gql`
  fragment PropertySchemaItemFragment on PropertySchemaGroup {
    schemaGroupId
    title
    translatedTitle
    isList
    representativeFieldId
    isAvailableIf {
      fieldId
      type
      value
    }
    fields {
      fieldId
      title
      description
      translatedTitle
      translatedDescription
      prefix
      suffix
      type
      defaultValue
      ui
      min
      max
      choices {
        key
        icon
        title
        translatedTitle
      }
      isAvailableIf {
        fieldId
        type
        value
      }
    }
  }

  fragment PropertyItemFragment on PropertyItem {
    ... on PropertyGroupList {
      id
      schemaGroupId
      groups {
        id
        schemaGroupId
        fields {
          id
          fieldId
          type
          value
          links {
            ...PropertyFieldLink
          }
        }
      }
    }
    ... on PropertyGroup {
      id
      schemaGroupId
      fields {
        id
        fieldId
        type
        value
        links {
          ...PropertyFieldLink
        }
      }
    }
  }

  fragment PropertyFragmentWithoutSchema on Property {
    id
    items {
      ...PropertyItemFragment
    }
  }

  fragment PropertyFragment on Property {
    id
    ...PropertyFragmentWithoutSchema
    schema {
      id
      groups {
        ...PropertySchemaItemFragment
      }
    }
  }

  fragment MergedPropertyGroupCommonFragment on MergedPropertyGroup {
    schemaGroupId
    fields {
      fieldId
      type
      actualValue
      overridden
      links {
        ...PropertyFieldLink
      }
    }
  }

  fragment MergedPropertyGroupFragment on MergedPropertyGroup {
    ...MergedPropertyGroupCommonFragment
    groups {
      ...MergedPropertyGroupCommonFragment
    }
  }

  fragment MergedPropertyFragmentWithoutSchema on MergedProperty {
    originalId
    parentId
    linkedDatasetId
    groups {
      ...MergedPropertyGroupFragment
    }
  }

  fragment MergedPropertyFragment on MergedProperty {
    ...MergedPropertyFragmentWithoutSchema
    schema {
      id
    }
  }

  fragment PropertyFieldLink on PropertyFieldLink {
    datasetId
    datasetSchemaId
    datasetSchemaFieldId
    datasetSchema {
      id
      name
    }
    dataset {
      id
      name
    }
    datasetSchemaField {
      id
      name
    }
  }
`;

export default propertyFragment;
