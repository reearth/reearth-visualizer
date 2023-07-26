import { gql } from "@reearth/services/gql/__gen__";

export const CREATE_STORY = gql(`
  mutation CreateStory($input: CreateStoryInput!) {
    createStory(input: $input) {
      story {
        ...StoryFragment
      }
    }
  }
`);

export const UPDATE_STORY = gql(`
  mutation UpdateStory($input: UpdateStoryInput!) {
    updateStory(input: $input) {
      story {
        ...StoryFragment
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

export const CREATE_STORY_PAGE = gql(`
  mutation CreateStoryPage($input: CreateStoryPageInput!) {
    createStoryPage(input: $input) {
      story {
        ...StoryFragment
      }
    }
  }
`);

export const UPDATE_STORY_PAGE = gql(`
  mutation UpdateStoryPage($input: UpdateStoryPageInput!) {
    updateStoryPage(input: $input) {
      story {
        ...StoryFragment
      }
    }
  }
`);

export const DELETE_STORY_PAGE = gql(`
  mutation DeleteStoryPage($input: DeleteStoryPageInput!) {
    removeStoryPage(input: $input) {
      story {
        ...StoryFragment
      }
    }
  }
`);

export const MOVE_STORY_PAGE = gql(`
  mutation MoveStoryPage($input: MoveStoryPageInput!) {
    moveStoryPage(input: $input) {
      story {
        ...StoryFragment
      }
    }
  }
`);
