import { Asset } from "@reearth/app/features/AssetsManager/types";
import { useAssetMutations, useAssets } from "@reearth/services/api/asset";
import { useProjectId, useWorkspace } from "@reearth/services/state";
import { useCallback, useRef } from "react";

import { AssetSource, SORTS, SortKey } from "./types";

const ASSETS_PER_PAGE = 20;

// Assets uploaded to the current Visualizer project.
export default ({
  sort,
  keyword
}: {
  sort: SortKey;
  keyword?: string;
}): AssetSource => {
  const [currentWorkspace] = useWorkspace();
  const [projectId] = useProjectId();
  const workspaceId = currentWorkspace?.id ?? "";

  const { assets, hasMoreAssets, isRefetching, endCursor, loading, fetchMore } =
    useAssets({
      workspaceId,
      projectId,
      pagination: { first: ASSETS_PER_PAGE },
      sort: SORTS[sort],
      keyword
    });

  const loadingMoreRef = useRef(false);
  const loadMore = useCallback(async () => {
    if (!hasMoreAssets || isRefetching || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    await fetchMore({
      variables: { pagination: { first: ASSETS_PER_PAGE, after: endCursor } }
    });
    loadingMoreRef.current = false;
  }, [endCursor, fetchMore, hasMoreAssets, isRefetching]);

  const { createAssets } = useAssetMutations();
  const uploadFile = useCallback(
    async (file: File) => {
      // createAssets takes a FileList-like collection.
      const res = await createAssets({
        workspaceId,
        projectId,
        file: [file] as unknown as FileList,
        coreSupport: true
      });
      return res?.data[0]?.data?.createAsset?.asset.id;
    },
    [createAssets, projectId, workspaceId]
  );

  return {
    assets: (assets ?? []) as Asset[],
    loading,
    loadMore,
    uploadFile
  };
};
