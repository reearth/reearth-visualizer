import { useCallback, useMemo } from "react";
import useFileInput from "use-file-input";

import { useAssetsFetcher } from "@reearth/services/api";

import { FILE_FORMATS, IMAGE_FORMATS } from "../../features/Assets/constants";

export default ({
  workspaceId,
  onAssetSelect,
  assetType,
}: {
  workspaceId?: string;
  onAssetSelect?: (inputValue?: string) => void;
  assetType?: string;
}) => {
  const { useCreateAssets } = useAssetsFetcher();

  const acceptedExtension = useMemo(() => {
    return assetType === "image"
      ? IMAGE_FORMATS
      : assetType === "file"
      ? FILE_FORMATS
      : IMAGE_FORMATS + "," + FILE_FORMATS;
  }, [assetType]);

  const handleAssetsCreate = useCallback(
    async (files?: FileList) => {
      if (!files) return;
      const result = await useCreateAssets({ teamId: workspaceId ?? "", file: files });
      const assetUrl = result?.data[0].data?.createAsset?.asset.url;

      onAssetSelect?.(assetUrl);
    },
    [workspaceId, useCreateAssets, onAssetSelect],
  );
  const handleFileUpload = useFileInput(files => handleAssetsCreate?.(files), {
    accept: acceptedExtension,
    multiple: true,
  });

  return { handleFileUpload };
};
