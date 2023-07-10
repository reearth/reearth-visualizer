import { gql } from "@reearth/services/gql/__gen__";

export const CREATE_WORKSPACE = gql(`
  mutation CreateWorkspace($name: String!) {
    createTeam(input: { name: $name }) {
      team {
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
          datasetSchemaCount
          datasetCount
        }
      }
    }
  }
`);
