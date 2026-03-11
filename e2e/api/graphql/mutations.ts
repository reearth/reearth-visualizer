export const CREATE_PROJECT = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      project { id name description alias }
    }
  }
`;

export const CREATE_SCENE = `
  mutation CreateScene($input: CreateSceneInput!) {
    createScene(input: $input) {
      scene { id }
    }
  }
`;

export const UPDATE_PROJECT = `
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      project { id name description starred isDeleted }
    }
  }
`;

export const DELETE_PROJECT = `
  mutation DeleteProject($input: DeleteProjectInput!) {
    deleteProject(input: $input) { projectId }
  }
`;

export const CREATE_WORKSPACE = `
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      workspace { id name personal members { userId role } }
    }
  }
`;

export const UPDATE_WORKSPACE = `
  mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
    updateWorkspace(input: $input) {
      workspace { id name members { userId role } }
    }
  }
`;

export const DELETE_WORKSPACE = `
  mutation DeleteWorkspace($input: DeleteWorkspaceInput!) {
    deleteWorkspace(input: $input) { workspaceId }
  }
`;

export const ADD_MEMBER_TO_WORKSPACE = `
  mutation AddMemberToWorkspace($input: AddMemberToWorkspaceInput!) {
    addMemberToWorkspace(input: $input) {
      workspace { id members { userId role } }
    }
  }
`;

export const REMOVE_MEMBER_FROM_WORKSPACE = `
  mutation RemoveMemberFromWorkspace($input: RemoveMemberFromWorkspaceInput!) {
    removeMemberFromWorkspace(input: $input) {
      workspace { id members { userId role } }
    }
  }
`;

export const UPDATE_MEMBER_OF_WORKSPACE = `
  mutation UpdateMemberOfWorkspace($input: UpdateMemberOfWorkspaceInput!) {
    updateMemberOfWorkspace(input: $input) {
      workspace { id members { userId role } }
    }
  }
`;

export const PUBLISH_PROJECT = `
  mutation PublishProject($input: PublishProjectInput!) {
    publishProject(input: $input) {
      project { id alias publishmentStatus }
    }
  }
`;

export const UPDATE_PROPERTY_VALUE = `
  mutation UpdatePropertyValue(
    $propertyId: ID!
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
    $value: Any
    $type: ValueType!
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
      property { id }
      propertyField { id type value }
    }
  }
`;

export const REMOVE_PROPERTY_FIELD = `
  mutation RemovePropertyField(
    $propertyId: ID!
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
  ) {
    removePropertyField(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        fieldId: $fieldId
      }
    ) {
      property { id }
    }
  }
`;

export const UNLINK_PROPERTY_VALUE = `
  mutation UnlinkPropertyValue(
    $propertyId: ID!
    $schemaGroupId: ID
    $itemId: ID
    $fieldId: ID!
  ) {
    unlinkPropertyValue(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        fieldId: $fieldId
      }
    ) {
      property { id }
      propertyField { id type value }
    }
  }
`;

export const ADD_PROPERTY_ITEM = `
  mutation AddPropertyItem(
    $propertyId: ID!
    $schemaGroupId: ID!
    $index: Int
    $nameFieldValue: Any
    $nameFieldType: ValueType
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
        items {
          ... on PropertyGroupList {
            id
            schemaGroupId
            groups { id schemaGroupId }
          }
          ... on PropertyGroup {
            id
            schemaGroupId
          }
        }
      }
    }
  }
`;

export const MOVE_PROPERTY_ITEM = `
  mutation MovePropertyItem(
    $propertyId: ID!
    $schemaGroupId: ID!
    $itemId: ID!
    $index: Int!
  ) {
    movePropertyItem(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        index: $index
      }
    ) {
      property { id }
    }
  }
`;

export const REMOVE_PROPERTY_ITEM = `
  mutation RemovePropertyItem(
    $propertyId: ID!
    $schemaGroupId: ID!
    $itemId: ID!
  ) {
    removePropertyItem(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
      }
    ) {
      property { id }
    }
  }
`;

export const UPDATE_PROPERTY_ITEMS = `
  mutation UpdatePropertyItems(
    $propertyId: ID!
    $schemaGroupId: ID!
    $operations: [UpdatePropertyItemOperationInput!]!
  ) {
    updatePropertyItems(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        operations: $operations
      }
    ) {
      property { id }
    }
  }
`;

export const CREATE_STORY = `
  mutation CreateStory($input: CreateStoryInput!) {
    createStory(input: $input) {
      story { id }
    }
  }
`;

export const PUBLISH_STORY = `
  mutation PublishStory($input: PublishStoryInput!) {
    publishStory(input: $input) {
      story { id alias publishmentStatus }
    }
  }
`;
