import { gql } from "@apollo/client";

export const storyFragment = gql`
  fragment StoryFragment on Story {
    id
    title
    panelPosition
    bgColor
    isBasicAuthActive
    basicAuthUsername
    basicAuthPassword
    alias
    publicTitle
    publicDescription
    publishmentStatus
    publicImage
    publicNoIndex
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
    layersIds
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
