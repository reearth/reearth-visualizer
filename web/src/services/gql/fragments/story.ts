import { gql } from "@apollo/client";

export const storyFragment = gql`
  fragment StoryFragment on Story {
    id
    title
    pages {
      ...StoryPageFragment
    }
  }
`;

export const storyPageFragment = gql`
  fragment StoryPageFragment on StoryPage {
    id
    title
    swipeable
    propertyId
    property {
      id
      ...PropertyFragment
    }
    blocks {
      id
      pluginId
      extensionId
      property {
        id
        ...PropertyFragment
      }
    }
  }
`;
