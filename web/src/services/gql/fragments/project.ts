import { gql } from "@apollo/client";

export const projectFragment = gql`
  fragment ProjectFragment on Project {
    id
    workspaceId
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
    projectAlias
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
`;
