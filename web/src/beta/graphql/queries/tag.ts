import { gql } from "@apollo/client";

export const GET_SCENE_TAGS = gql`
  query GetSceneTags($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        tags {
          id
          label
          ... on TagGroup {
            tags {
              id
              label
            }
          }
          ... on TagItem {
            parentId
            parent {
              id
              label
              tags {
                id
                label
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_LAYER_TAGS = gql`
  query GetLayerTags($layerId: ID!) {
    layer(id: $layerId) {
      id
      tags {
        tagId
        tag {
          id
          label
        }
        ... on LayerTagGroup {
          children {
            tag {
              id
              label
            }
          }
        }
      }
    }
  }
`;

export const CREATE_TAG_GROUP = gql`
  mutation CreateTagGroup($sceneId: ID!, $label: String!) {
    createTagGroup(input: { sceneId: $sceneId, label: $label }) {
      tag {
        id
        label
        tags {
          id
          label
        }
      }
    }
  }
`;

export const CREATE_TAG_ITEM = gql`
  mutation CreateTagItem(
    $sceneId: ID!
    $label: String!
    $parent: ID
    $linkedDatasetSchemaId: ID
    $linkedDatasetID: ID
    $linkedDatasetField: ID
  ) {
    createTagItem(
      input: {
        sceneId: $sceneId
        label: $label
        parent: $parent
        linkedDatasetSchemaID: $linkedDatasetSchemaId
        linkedDatasetID: $linkedDatasetID
        linkedDatasetField: $linkedDatasetField
      }
    ) {
      tag {
        id
        label
        parentId
      }
      parent {
        id
        label
        tags {
          id
          label
        }
      }
    }
  }
`;

export const REMOVE_TAG = gql`
  mutation RemoveTag($tagId: ID!) {
    removeTag(input: { tagID: $tagId }) {
      tagId
      updatedLayers {
        id
        tags {
          tagId
          tag {
            id
            label
          }
          ... on LayerTagGroup {
            children {
              tag {
                id
                label
              }
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($tagId: ID!, $sceneId: ID!, $label: String) {
    updateTag(input: { tagId: $tagId, sceneId: $sceneId, label: $label }) {
      tag {
        id
        label
      }
    }
  }
`;

export const ATTACH_TAG_ITEM_TO_GROUP = gql`
  mutation AttachTagItemToGroup($itemId: ID!, $groupId: ID!) {
    attachTagItemToGroup(input: { itemID: $itemId, groupID: $groupId }) {
      tag {
        id
        label
        tags {
          id
          label
        }
      }
    }
  }
`;

export const DETACH_TAG_ITEM_FROM_GROUP = gql`
  mutation DetachTagItemFromGroup($itemId: ID!, $groupId: ID!) {
    detachTagItemFromGroup(input: { itemID: $itemId, groupID: $groupId }) {
      tag {
        id
        label
        tags {
          id
          label
        }
      }
    }
  }
`;

export const ATTACH_TAG_TO_LAYER = gql`
  mutation AttachTagToLayer($tagId: ID!, $layerId: ID!) {
    attachTagToLayer(input: { tagID: $tagId, layerID: $layerId }) {
      layer {
        id
        tags {
          tagId
          tag {
            id
            label
          }
          ... on LayerTagGroup {
            children {
              tag {
                id
                label
              }
            }
          }
        }
      }
    }
  }
`;

export const DETACH_TAG_FROM_LAYER = gql`
  mutation DetachTagFromLayer($tagId: ID!, $layerId: ID!) {
    detachTagFromLayer(input: { tagID: $tagId, layerID: $layerId }) {
      layer {
        id
        tags {
          tagId
          tag {
            id
            label
          }
          ... on LayerTagGroup {
            children {
              tag {
                id
                label
              }
            }
          }
        }
      }
    }
  }
`;
