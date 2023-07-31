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
