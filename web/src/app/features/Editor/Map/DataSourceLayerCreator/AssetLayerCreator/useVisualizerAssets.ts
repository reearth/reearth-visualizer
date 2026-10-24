import { Asset } from "@reearth/app/features/AssetsManager/types";
import { useAssetMutations, useAssets } from "@reearth/services/api/asset";
import { useProjectId, useWorkspace } from "@reearth/services/state";
import { useCallback, useRef } from "react";
import useFileInput from "use-file-input";

import { AssetSource, SORTS, SortKey } from "./types";
import { ACCEPT_STRING } from "./utils";

const ASSETS_PER_PAGE = 20;

// Assets uploaded to the current Visualizer project.
export default ({
  sort,
  keyword,
  onUploaded
}: {
  sort: SortKey;
  keyword?: string;
  onUploaded: (assetId: string) => void;
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

  // Upload, then report the new asset so it can be selected straight away.
  const { createAssets } = useAssetMutations();
  const upload = useFileInput(
    async (files) => {
      const res = await createAssets({
        workspaceId,
        projectId,
        file: files,
        coreSupport: true
      });
      const uploadedId = res?.data[0]?.data?.createAsset?.asset.id;
      if (uploadedId) onUploaded(uploadedId);
    },
    { accept: ACCEPT_STRING, multiple: false }
  );

  return {
    assets: (assets ?? []) as Asset[],
    loading,
    loadMore,
    upload
  };
};
