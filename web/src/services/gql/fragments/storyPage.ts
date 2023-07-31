import { gql } from "@apollo/client";

export const storyPageFragment = gql`
  fragment StoryPageFragment on StoryPage {
    id
    title
    swipeable
  }
`;
