import {
  type AcceptedAssetsTypes,
  GIS_FILE_TYPES,
  IMAGE_FILE_TYPES,
  GENERAL_FILE_TYPE_ACCEPT_STRING,
  MODEL_FILE_TYPES
} from "@reearth/app/features/AssetsManager/constants";
import { useAssetsFetcher } from "@reearth/services/api";
import { useCallback, useMemo } from "react";
import useFileInput from "use-file-input";

export default ({
  workspaceId,
  projectId,
  onAssetSelect,
  assetsTypes,
  multiple = true
}: {
  workspaceId?: string;
  projectId?: string;
  onAssetSelect?: (inputValue?: string, name?: string) => void;
  assetsTypes?: AcceptedAssetsTypes;
  multiple?: boolean;
}) => {
  const { useCreateAssets } = useAssetsFetcher();

  const acceptedExtension = useMemo(() => {
    return assetsTypes && assetsTypes.length > 0
      ? "." +
          assetsTypes
            .map((t) =>
              t === "image"
                ? IMAGE_FILE_TYPES
                : t === "file"
                  ? GIS_FILE_TYPES
                  : t === "model"
                    ? MODEL_FILE_TYPES
                    : t
            )
            .flat()
            .join(",.")
      : GENERAL_FILE_TYPE_ACCEPT_STRING;
  }, [assetsTypes]);

  const handleAssetsCreate = useCallback(
    async (files?: FileList) => {
      if (!files) return;
      try {
        const result = await useCreateAssets({
          workspaceId: workspaceId ?? "",
          projectId,
          file: files,
          coreSupport: true
        });
        const assetUrl = result?.data[0].data?.createAsset?.asset.url;
        const assetName = result?.data[0].data?.createAsset?.asset.name;
        onAssetSelect?.(assetUrl, assetName);
      } catch (error) {
        console.error("Error creating assets:", error);
      }
    },
    [useCreateAssets, workspaceId, projectId, onAssetSelect]
  );
  const handleFileUpload = useFileInput(
    (files) => handleAssetsCreate?.(files),
    {
      accept: acceptedExtension,
      multiple
    }
  );

  return { handleFileUpload };
};
