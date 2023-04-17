import { gql } from "@apollo/client";

export const projectFragment = gql`
  fragment ProjectFragment on Project {
    id
    name
    description
    imageUrl
    isArchived
    isBasicAuthActive
    basicAuthUsername
    basicAuthPassword
    publicTitle
    publicDescription
    publicImage
    alias
    publishmentStatus
    updatedAt
  }
`;
