import { gql } from "@apollo/client";

const propertyFragment = gql`
  fragment PropertySchemaFieldFragment on PropertySchemaField {
    fieldId
    title
    description
    translatedTitle(lang: $lang)
    translatedDescription(lang: $lang)
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
      translatedTitle(lang: $lang)
    }
    isAvailableIf {
      fieldId
      type
      value
    }
  }

  fragment PropertySchemaGroupFragment on PropertySchemaGroup {
    schemaGroupId
    title
    collection
    translatedTitle(lang: $lang)
    isList
    representativeFieldId
    isAvailableIf {
      fieldId
      type
      value
    }
    fields {
      ...PropertySchemaFieldFragment
    }
  }

  fragment PropertyFieldFragment on PropertyField {
    id
    fieldId
    type
    value
    links {
      ...PropertyFieldLink
    }
  }

  fragment PropertyGroupFragment on PropertyGroup {
    id
    schemaGroupId
    fields {
      ...PropertyFieldFragment
    }
  }

  fragment PropertyItemFragment on PropertyItem {
    ... on PropertyGroupList {
      id
      schemaGroupId
      groups {
        ...PropertyGroupFragment
      }
    }
    ... on PropertyGroup {
      ...PropertyGroupFragment
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
        ...PropertySchemaGroupFragment
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
  }
`;

export default propertyFragment;
