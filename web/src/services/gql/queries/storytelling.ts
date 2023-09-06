import { gql } from "@reearth/services/gql/__gen__";

export const CREATE_STORY = gql(`
  mutation CreateStory($input: CreateStoryInput!) {
    createStory(input: $input) {
      story {
        id
      }
    }
  }
`);

export const UPDATE_STORY = gql(`
  mutation UpdateStory($input: UpdateStoryInput!) {
    updateStory(input: $input) {
      story {
        id
      }
    }
  }
`);

export const DELETE_STORY = gql(`
  mutation DeleteStory($input: DeleteStoryInput!) {
    deleteStory(input: $input) {
      storyId
    }
  }
`);

export const PUBLISH_STORY = gql(`
  mutation PublishStory($storyId: ID!, $alias: String, $status: PublishmentStatus!) {
    publishStory(input: { storyId: $storyId, alias: $alias, status: $status }) {
      story {
        id
        alias
        publishmentStatus
      }
    }
  }
`);

export const CREATE_STORY_PAGE = gql(`
  mutation CreateStoryPage($input: CreateStoryPageInput!) {
    createStoryPage(input: $input) {
      story {
        id
      }
    }
  }
`);

export const UPDATE_STORY_PAGE = gql(`
  mutation UpdateStoryPage($input: UpdateStoryPageInput!) {
    updateStoryPage(input: $input) {
      story {
        id
      }
    }
  }
`);

export const DELETE_STORY_PAGE = gql(`
  mutation DeleteStoryPage($input: DeleteStoryPageInput!) {
    removeStoryPage(input: $input) {
      story {
        id
      }
    }
  }
`);

export const MOVE_STORY_PAGE = gql(`
  mutation MoveStoryPage($input: MoveStoryPageInput!) {
    moveStoryPage(input: $input) {
      story {
        id
      }
    }
  }
`);

export const CREATE_STORY_BLOCK = gql(`
  mutation CreateStoryBlock($input: CreateStoryBlockInput!){
    createStoryBlock(input: $input) {
      index
      block {
        id
      }
      page {
        id
      }
      story {
        id
      }
    }
  }
`);

export const MOVE_STORY_BLOCK = gql(`
  mutation MoveStoryBlock($input: MoveStoryBlockInput!){
    moveStoryBlock(input: $input) {
      index
      blockId
      page {
        id
      }
      story {
        id
      }
    }
  }
`);

export const REMOVE_STORY_BLOCK = gql(`
  mutation RemoveStoryBlock($input: RemoveStoryBlockInput!){
    removeStoryBlock(input: $input) {
      blockId
      page {
        id
      }
      story {
        id
      }
    }
  }
`);
