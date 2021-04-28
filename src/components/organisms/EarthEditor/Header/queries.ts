import { gql } from "@apollo/client";

export const GET_PROJECT = gql`
  query GetProject($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        teamId
        projectId
        project {
          id
          alias
          publishmentStatus
          name
        }
      }
    }
  }
`;

export const GET_TEAM_PROJECTS = gql`
  query GetTeamProjects($teamId: ID!, $includeArchived: Boolean, $first: Int, $last: Int) {
    projects(teamId: $teamId, includeArchived: $includeArchived, first: $first, last: $last) {
      nodes {
        id
        name
      }
    }
  }
`;

export const CHECK_PROJECT_ALIAS = gql`
  query CheckProjectAlias($alias: String!) {
    checkProjectAlias(alias: $alias) {
      alias
      available
    }
  }
`;
export const PUBLISH_PROJECT = gql`
  mutation PublishProject($projectId: ID!, $alias: String, $status: PublishmentStatus!) {
    publishProject(input: { projectId: $projectId, alias: $alias, status: $status }) {
      project {
        id
        alias
        publishmentStatus
      }
    }
  }
`;
