import { gql } from "@apollo/client";

export const projectFragment = gql`
  fragment ProjectFragment on Project {
    id
    teamId
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
    publishedAt
    publicNoIndex
    alias
    enableGa
    trackingId
    publishmentStatus
    updatedAt
    createdAt
    coreSupport
    starred
    isDeleted
    metadata {
      id
      ...ProjectMetadataFragment
    }
    visualizer
    visibility
  }
`;

export const projectMetadataFragment = gql`
  fragment ProjectMetadataFragment on ProjectMetadata {
  project
  workspace
  readme
  license
  importStatus
  createdAt
  updatedAt
}
`