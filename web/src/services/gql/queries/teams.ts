import { gql } from "@apollo/client";

export const GetTeamsDocument = gql`
  fragment Team on Team {
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

  query GetTeams {
    me {
      id
      name
      myTeam {
        id
        ...Team
      }
      teams {
        id
        ...Team
      }
    }
  }
`;
