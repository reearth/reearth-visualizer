import {
  CMSProject,
  useCMSAssets,
  useCMSAssetsAcrossProjects,
  useCMSModels,
  useCMSModelsAcrossProjects
} from "@reearth/services/api/cms";
import { useWorkspace } from "@reearth/services/state";
import { useMemo } from "react";

import { AssetSource, LayerAsset, SortKey } from "./types";
import { cmsAssetLayer, sortAssets } from "./utils";

// CMS assets, or models as GeoJSON layers, of one project or (without
// projectId) of all the given projects. CMS can't search or sort these, so
// both apply to the pages loaded so far. Nothing is fetched while skipped.
export default ({
  tab,
  skip,
  projects,
  projectId,
  sort,
  keyword
}: {
  tab: "cmsAssets" | "cmsModels";
  skip?: boolean;
  projects: CMSProject[];
  projectId?: string;
  sort: SortKey;
  keyword?: string;
}): AssetSource => {
  const [currentWorkspace] = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const all = !projectId;
  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);
  const showAssets = !skip && tab === "cmsAssets";
  const showModels = !skip && tab === "cmsModels";

  const oneAssets = useCMSAssets({
    workspaceId,
    projectId,
    skip: !showAssets || all
  });
  const allAssets = useCMSAssetsAcrossProjects({
    workspaceId,
    projectIds,
    skip: !showAssets || !all
  });
  const oneModels = useCMSModels({
    workspaceId,
    projectId,
    skip: !showModels || all
  });
  const allModels = useCMSModelsAcrossProjects({
    workspaceId,
    projectIds,
    skip: !showModels || !all
  });
  const assetsSource = all ? allAssets : oneAssets;
  const modelsSource = all ? allModels : oneModels;
  const source = tab === "cmsAssets" ? assetsSource : modelsSource;
  const incomplete = all
    ? (tab === "cmsAssets" ? allAssets : allModels).failedCount > 0
    : !!(tab === "cmsAssets" ? oneAssets : oneModels).error;

  const assets = useMemo(() => {
    const projectNames = new Map(projects.map((p) => [p.id, p.name]));
    const items: LayerAsset[] =
      tab === "cmsAssets"
        ? (assetsSource.assets ?? []).map((a) => ({
            id: a.id,
            workspaceId: workspaceId ?? "",
            name: a.filename,
            size: a.size,
            ...cmsAssetLayer(a),
            private: a.public === false,
            createdAt: a.createdAt,
            contentType: "",
            projectName: projectNames.get(a.projectId)
          }))
        : (modelsSource.models ?? []).map((m) => ({
            id: m.id,
            workspaceId: workspaceId ?? "",
            name: m.name,
            size: 0,
            // The model's items, served as GeoJSON by the CMS Public API.
            url: `${m.publicApiEp}.geojson`,
            createdAt: m.createdAt,
            contentType: "",
            format: "geojson",
            projectName: projectNames.get(m.projectId),
            modelName: m.name,
            modelUrl: m.editorUrl
          }));
    const term = keyword?.toLowerCase();
    return sortAssets(
      term ? items.filter((a) => a.name.toLowerCase().includes(term)) : items,
      sort
    );
  }, [
    assetsSource.assets,
    keyword,
    modelsSource.models,
    projects,
    sort,
    tab,
    workspaceId
  ]);

  return {
    assets,
    loading: source.loading,
    loadMore: source.loadMore,
    incomplete
  };
};
