import {
  type AcceptedAssetsTypes,
  GIS_FILE_TYPES,
  IMAGE_FILE_TYPES,
  GENERAL_FILE_TYPE_ACCEPT_STRING,
  MODEL_FILE_TYPES
} from "@reearth/app/features/AssetsManager/constants";
import { useAssetMutations } from "@reearth/services/api/asset";
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
  const { createAssets, createIconAssets } = useAssetMutations();

  const isIcon = useMemo(
    () => assetsTypes?.includes("icon") ?? false,
    [assetsTypes]
  );

  const acceptedExtension = useMemo(() => {
    return assetsTypes && assetsTypes.length > 0
      ? "." +
          assetsTypes
            .map((t) =>
              t === "image" || t === "icon"
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
        if (isIcon) {
          const result = await createIconAssets({
            workspaceId: workspaceId ?? "",
            projectId,
            file: files
          });
          const assetUrl = result?.data[0].data?.createIconAsset?.asset.url;
          const assetName = result?.data[0].data?.createIconAsset?.asset.name;
          onAssetSelect?.(assetUrl, assetName);
        } else {
          const result = await createAssets({
            workspaceId: workspaceId ?? "",
            projectId,
            file: files,
            coreSupport: true
          });
          const assetUrl = result?.data[0].data?.createAsset?.asset.url;
          const assetName = result?.data[0].data?.createAsset?.asset.name;
          onAssetSelect?.(assetUrl, assetName);
        }
      } catch (error) {
        console.error("Error creating assets:", error);
      }
    },
    [createAssets, createIconAssets, workspaceId, projectId, onAssetSelect, isIcon]
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
