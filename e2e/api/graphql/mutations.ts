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

export const CREATE_ASSET = `
  mutation CreateAsset($workspaceId: ID!, $projectId: ID, $file: Upload!, $coreSupport: Boolean!) {
    createAsset(input: { workspaceId: $workspaceId, projectId: $projectId, file: $file, coreSupport: $coreSupport }) {
      asset { id workspaceId projectId name size url contentType coreSupport }
    }
  }
`;

export const UPDATE_ASSET = `
  mutation UpdateAsset($input: UpdateAssetInput!) {
    updateAsset(input: $input) { assetId projectId }
  }
`;

export const REMOVE_ASSET = `
  mutation RemoveAsset($input: RemoveAssetInput!) {
    removeAsset(input: $input) { assetId }
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

// Layer mutations

export const ADD_NLS_LAYER_SIMPLE = `
  mutation AddNLSLayerSimple($input: AddNLSLayerSimpleInput!) {
    addNLSLayerSimple(input: $input) {
      layers {
        id layerType title visible sceneId config
        infobox { id }
      }
    }
  }
`;

export const UPDATE_NLS_LAYER = `
  mutation UpdateNLSLayer($input: UpdateNLSLayerInput!) {
    updateNLSLayer(input: $input) {
      layer { id layerType title visible config }
    }
  }
`;

export const UPDATE_NLS_LAYERS = `
  mutation UpdateNLSLayers($input: UpdateNLSLayersInput!) {
    updateNLSLayers(input: $input) {
      layers { id layerType title visible config }
    }
  }
`;

export const REMOVE_NLS_LAYER = `
  mutation RemoveNLSLayer($input: RemoveNLSLayerInput!) {
    removeNLSLayer(input: $input) { layerId }
  }
`;

export const DUPLICATE_NLS_LAYER = `
  mutation DuplicateNLSLayer($input: DuplicateNLSLayerInput!) {
    duplicateNLSLayer(input: $input) {
      layer {
        id layerType title visible sceneId
      }
    }
  }
`;

// Infobox mutations

export const CREATE_NLS_INFOBOX = `
  mutation CreateNLSInfobox($input: CreateNLSInfoboxInput!) {
    createNLSInfobox(input: $input) {
      layer {
        id
        infobox { id sceneId layerId propertyId blocks { id pluginId extensionId } }
      }
    }
  }
`;

export const REMOVE_NLS_INFOBOX = `
  mutation RemoveNLSInfobox($input: RemoveNLSInfoboxInput!) {
    removeNLSInfobox(input: $input) {
      layer { id infobox { id } }
    }
  }
`;

export const ADD_NLS_INFOBOX_BLOCK = `
  mutation AddNLSInfoboxBlock($input: AddNLSInfoboxBlockInput!) {
    addNLSInfoboxBlock(input: $input) {
      layer {
        id
        infobox { id blocks { id pluginId extensionId } }
      }
    }
  }
`;

export const MOVE_NLS_INFOBOX_BLOCK = `
  mutation MoveNLSInfoboxBlock($input: MoveNLSInfoboxBlockInput!) {
    moveNLSInfoboxBlock(input: $input) {
      layer {
        id
        infobox { id blocks { id pluginId extensionId } }
      }
    }
  }
`;

export const REMOVE_NLS_INFOBOX_BLOCK = `
  mutation RemoveNLSInfoboxBlock($input: RemoveNLSInfoboxBlockInput!) {
    removeNLSInfoboxBlock(input: $input) {
      layer {
        id
        infobox { id blocks { id pluginId extensionId } }
      }
    }
  }
`;

// Photo overlay mutations

export const CREATE_NLS_PHOTO_OVERLAY = `
  mutation CreateNLSPhotoOverlay($input: CreateNLSPhotoOverlayInput!) {
    createNLSPhotoOverlay(input: $input) {
      layer {
        id
        photoOverlay { id sceneId layerId propertyId }
      }
    }
  }
`;

export const REMOVE_NLS_PHOTO_OVERLAY = `
  mutation RemoveNLSPhotoOverlay($input: RemoveNLSPhotoOverlayInput!) {
    removeNLSPhotoOverlay(input: $input) {
      layer { id photoOverlay { id } }
    }
  }
`;

// Custom property mutations

export const UPDATE_CUSTOM_PROPERTIES = `
  mutation UpdateCustomProperties($input: UpdateCustomPropertySchemaInput!) {
    updateCustomProperties(input: $input) {
      layer { id }
    }
  }
`;

export const CHANGE_CUSTOM_PROPERTY_TITLE = `
  mutation ChangeCustomPropertyTitle($input: ChangeCustomPropertyTitleInput!) {
    changeCustomPropertyTitle(input: $input) {
      layer { id }
    }
  }
`;

export const REMOVE_CUSTOM_PROPERTY = `
  mutation RemoveCustomProperty($input: RemoveCustomPropertyInput!) {
    removeCustomProperty(input: $input) {
      layer { id }
    }
  }
`;

// Story mutations

export const UPDATE_STORY = `
  mutation UpdateStory($input: UpdateStoryInput!) {
    updateStory(input: $input) {
      story { id title panelPosition bgColor }
    }
  }
`;

export const DELETE_STORY = `
  mutation DeleteStory($input: DeleteStoryInput!) {
    deleteStory(input: $input) { storyId }
  }
`;

export const MOVE_STORY = `
  mutation MoveStory($input: MoveStoryInput!) {
    moveStory(input: $input) {
      stories { id }
      storyId
    }
  }
`;

// Story page mutations

export const CREATE_STORY_PAGE = `
  mutation CreateStoryPage($input: CreateStoryPageInput!) {
    createStoryPage(input: $input) {
      story { id pages { id title swipeable } }
      page { id title swipeable }
    }
  }
`;

export const UPDATE_STORY_PAGE = `
  mutation UpdateStoryPage($input: UpdateStoryPageInput!) {
    updateStoryPage(input: $input) {
      story { id pages { id title swipeable } }
      page { id title swipeable }
    }
  }
`;

export const MOVE_STORY_PAGE = `
  mutation MoveStoryPage($input: MoveStoryPageInput!) {
    moveStoryPage(input: $input) {
      story { id pages { id title } }
      page { id title }
    }
  }
`;

export const DUPLICATE_STORY_PAGE = `
  mutation DuplicateStoryPage($input: DuplicateStoryPageInput!) {
    duplicateStoryPage(input: $input) {
      story { id pages { id title } }
      page { id title }
    }
  }
`;

export const REMOVE_STORY_PAGE = `
  mutation RemoveStoryPage($input: DeleteStoryPageInput!) {
    removeStoryPage(input: $input) {
      story { id pages { id title } }
      pageId
    }
  }
`;

// Story page layer mutations

export const ADD_PAGE_LAYER = `
  mutation AddPageLayer($input: PageLayerInput!) {
    addPageLayer(input: $input) {
      story { id }
      page { id layersIds }
    }
  }
`;

export const REMOVE_PAGE_LAYER = `
  mutation RemovePageLayer($input: PageLayerInput!) {
    removePageLayer(input: $input) {
      story { id }
      page { id layersIds }
    }
  }
`;

// Story block mutations

export const CREATE_STORY_BLOCK = `
  mutation CreateStoryBlock($input: CreateStoryBlockInput!) {
    createStoryBlock(input: $input) {
      story { id }
      page { id blocks { id pluginId extensionId } }
      block { id pluginId extensionId }
    }
  }
`;

export const MOVE_STORY_BLOCK = `
  mutation MoveStoryBlock($input: MoveStoryBlockInput!) {
    moveStoryBlock(input: $input) {
      story { id }
      page { id blocks { id pluginId extensionId } }
      blockId
    }
  }
`;

export const REMOVE_STORY_BLOCK = `
  mutation RemoveStoryBlock($input: RemoveStoryBlockInput!) {
    removeStoryBlock(input: $input) {
      story { id }
      page { id blocks { id pluginId extensionId } }
      blockId
    }
  }
`;
