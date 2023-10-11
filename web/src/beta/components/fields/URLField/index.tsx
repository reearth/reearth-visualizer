import React, { useCallback, useEffect, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Property from "@reearth/beta/components/fields";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import useHooks from "@reearth/beta/features/Assets/AssetsQueriesHook/hooks";
import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import { Asset } from "@reearth/beta/features/Assets/types";
import { useManageAssets } from "@reearth/beta/features/Assets/useManageAssets/hooks";
import ChooseAssetModal from "@reearth/beta/features/Modals/ChooseAssetModal";
import ChooseLayerStyleModal from "@reearth/beta/features/Modals/ChooseLayerStyleModal";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { useNotification, useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

export type Props = {
  value?: string;
  name?: string;
  description?: string;
  fileType?: "asset" | "URL" | "layerStyle";
  assetType?: "image" | "file" | "layerStyle";
  sceneId?: string;
  onChange?: (value: string | undefined) => void;
};

const URLField: React.FC<Props> = ({
  name,
  description,
  value,
  fileType,
  assetType,
  sceneId,
  onChange,
}) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [currentWorkspace] = useWorkspace();
  const [, setNotification] = useNotification();
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = useCallback(
    (inputValue?: string) => {
      if (!inputValue) return;

      if (
        fileType === "asset" &&
        !(checkIfFileType(inputValue, FILE_FORMATS) || checkIfFileType(inputValue, IMAGE_FORMATS))
      ) {
        setNotification({
          type: "error",
          text: t("Wrong file format"),
        });
        setCurrentValue(undefined);
        return;
      }

      setCurrentValue(inputValue);
      onChange?.(inputValue);
    },
    [fileType, onChange, setNotification, t],
  );

  const {
    assets,
    isLoading,
    hasMoreAssets,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    handleFileSelect,
    handleSortChange,
    handleSearchTerm,
  } = useHooks({
    workspaceId: currentWorkspace?.id,
    onAssetSelect: handleChange,
  });

  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { layerStyles } = useGetLayerStylesQuery({ sceneId });
  const [selectedLayerStyles, selectLayerStyle] = useState<LayerStyle[]>([]);

  const { localSearchTerm, wrapperRef, onScrollToBottom, handleSearchInputChange, handleSearch } =
    useManageAssets({
      selectedAssets,
      searchTerm,
      isLoading,
      hasMoreAssets,
      onGetMore: handleGetMoreAssets,
      onSortChange: handleSortChange,
      onSearch: handleSearchTerm,
    });

  const handleReset = useCallback(() => {
    const selectedAsset = assets?.find(a => a.url === currentValue);
    if (selectedAsset) {
      selectAsset([selectedAsset]);
    }
  }, [currentValue, assets, selectAsset]);

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const handleClose = useCallback(() => {
    setOpen(false);
    handleReset();
  }, [handleReset]);

  const handleClick = useCallback(() => setOpen(!open), [open]);

  const handleSelectAsset = useCallback(
    (asset?: Asset) => {
      if (!asset) return;
      selectAsset(!selectedAssets.includes(asset) ? [asset] : []);
    },
    [selectedAssets, selectAsset],
  );

  const handleSelectLayerStyle = useCallback(
    (layerStyle?: LayerStyle) => {
      if (!layerStyle) return;
      selectLayerStyle(!selectedLayerStyles.includes(layerStyle) ? [layerStyle] : []);
    },
    [selectLayerStyle, selectedLayerStyles],
  );

  return (
    <Property name={name} description={description}>
      <TextInput value={currentValue} onChange={handleChange} placeholder={t("Not set")} />
      {fileType === "asset" && (
        <ButtonWrapper>
          <AssetButton
            icon={assetType === "image" ? "imageStoryBlock" : "file"}
            text={t("Choose")}
            iconPosition="left"
            onClick={handleClick}
          />
          <AssetButton
            icon="uploadSimple"
            text={t("Upload")}
            iconPosition="left"
            onClick={handleFileSelect}
          />
        </ButtonWrapper>
      )}
      {fileType === "layerStyle" && <AssetButton icon="layerStyle" onClick={handleClick} />}
      {open && assetType !== "layerStyle" && (
        <ChooseAssetModal
          open={open}
          assetType={assetType}
          localSearchTerm={localSearchTerm}
          selectedAssets={selectedAssets}
          wrapperRef={wrapperRef}
          assets={assets}
          isLoading={isLoading}
          hasMoreAssets={hasMoreAssets}
          searchTerm={searchTerm}
          onClose={handleClose}
          handleSearch={handleSearch}
          handleSearchInputChange={handleSearchInputChange}
          onGetMore={handleGetMoreAssets}
          onScrollToBottom={onScrollToBottom}
          onSelectAsset={handleSelectAsset}
          onSelect={handleChange}
        />
      )}
      {open && fileType === "layerStyle" && (
        <ChooseLayerStyleModal
          open={open}
          localSearchTerm={localSearchTerm}
          selectedLayerStyles={selectedLayerStyles}
          wrapperRef={wrapperRef}
          layerStyles={layerStyles}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onClose={handleClose}
          handleSearch={handleSearch}
          handleSearchInputChange={handleSearchInputChange}
          onScrollToBottom={onScrollToBottom}
          onSelectLayerStyle={handleSelectLayerStyle}
          onSelect={handleChange}
        />
      )}
    </Property>
  );
};

const AssetButton = styled(Button)<{ active?: boolean }>`
  cursor: pointer;
  padding: 4px;
  flex: 1;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: space-between;
  gap: 4px;
`;

export default URLField;
