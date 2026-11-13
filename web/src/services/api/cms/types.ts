import {
  GetCmsAssetsQuery,
  GetCmsModelsQuery,
  GetCmsProjectsQuery
} from "@reearth/services/gql";

export type CMSProject = GetCmsProjectsQuery["cmsProjects"]["nodes"][number];
export type CMSModel = GetCmsModelsQuery["cmsModels"]["nodes"][number];
export type CMSAsset = GetCmsAssetsQuery["cmsAssets"]["nodes"][number];
