import { gql } from "@apollo/client";

export const GetWorkspacesDocument = gql`
  fragment Workspace on Workspace {
    id
    name
    members {
      user {
        id
        name
        email
      }
      userId
      role
    }
    personal
    policyId
    policy {
      id
      name
      projectCount
      memberCount
      publishedProjectCount
      layerCount
      assetStorageSize
    }
  }

  query GetWorkspaces {
    me {
      id
      name
      myWorkspace {
        id
        ...Workspace
      }
      workspaces {
        id
        ...Workspace
      }
    }
  }
`;
