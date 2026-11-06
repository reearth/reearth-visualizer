import { gql } from "@reearth/services/gql/__gen__";

export const GET_CMS_PROJECTS = gql(`
  query GetCMSProjects($workspaceId: ID!, $keyword: String, $page: Int, $pageSize: Int) {
    cmsProjects(workspaceId: $workspaceId, keyword: $keyword, page: $page, pageSize: $pageSize) {
      totalCount
      nodes { id name alias description workspaceId public createdAt updatedAt }
    }
  }
`);

export const GET_CMS_MODELS = gql(`
  query GetCMSModels($workspaceId: ID!, $projectId: ID!, $page: Int, $pageSize: Int) {
    cmsModels(workspaceId: $workspaceId, projectId: $projectId, page: $page, pageSize: $pageSize) {
      totalCount
      nodes { id projectId name description key publicApiEp editorUrl createdAt updatedAt }
    }
  }
`);

export const GET_CMS_ASSETS = gql(`
  query GetCMSAssets($workspaceId: ID!, $projectId: ID!, $page: Int, $pageSize: Int) {
    cmsAssets(workspaceId: $workspaceId, projectId: $projectId, page: $page, pageSize: $pageSize) {
      totalCount
      nodes { id projectId filename size previewType url archiveExtractionStatus public createdAt }
    }
  }
`);
