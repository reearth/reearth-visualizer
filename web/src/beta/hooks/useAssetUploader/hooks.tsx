import { useCallback, useMemo } from "react";
import useFileInput from "use-file-input";

import { AcceptedFileFormat } from "@reearth/beta/features/Assets/types";
import { useAssetsFetcher } from "@reearth/services/api";

import { FILE_FORMATS, IMAGE_FORMATS } from "../../features/Assets/constants";

export default ({
  workspaceId,
  onAssetSelect,
  assetType,
  fileFormat,
}: {
  workspaceId?: string;
  onAssetSelect?: (inputValue?: string, name?: string) => void;
  assetType?: string;
  fileFormat?: AcceptedFileFormat;
}) => {
  const { useCreateAssets } = useAssetsFetcher();

  const acceptedExtension = useMemo(() => {
    return assetType === "image"
      ? IMAGE_FORMATS
      : assetType === "file"
      ? fileFormat
        ? `.${fileFormat?.toLocaleLowerCase()}`
        : FILE_FORMATS
      : IMAGE_FORMATS + "," + FILE_FORMATS;
  }, [assetType, fileFormat]);

  const handleAssetsCreate = useCallback(
    async (files?: FileList) => {
      if (!files) return;
      const result = await useCreateAssets({
        teamId: workspaceId ?? "",
        file: files,
      });
      const assetUrl = result?.data[0].data?.createAsset?.asset.url;
      const assetName = result?.data[0].data?.createAsset?.asset.name;

      onAssetSelect?.(assetUrl, assetName);
    },
    [workspaceId, useCreateAssets, onAssetSelect],
  );
  const handleFileUpload = useFileInput(files => handleAssetsCreate?.(files), {
    accept: acceptedExtension,
    multiple: true,
  });

  return { handleFileUpload };
};
