import React, { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Property from "@reearth/beta/components/fields";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import useHooks from "@reearth/beta/features/Assets/AssetsQueriesHook/hooks";
import {
  FILE_FORMATS,
  IMAGE_FORMATS,
  VIDEO_FORMATS,
} from "@reearth/beta/features/Assets/constants";
import { Asset } from "@reearth/beta/features/Assets/types";
import { useManageAssets } from "@reearth/beta/features/Assets/useManageAssets/hooks";
import ChooseAssetModal from "@reearth/beta/features/Modals/ChooseAssetModal";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { useNotification, useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

export type Props = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  name?: string;
  description?: string;
  fileType?: "asset" | "URL";
  assetType?: "image" | "file";
};

const URLField: React.FC<Props> = ({ name, description, value, fileType, assetType, onChange }) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [currentWorkspace] = useWorkspace();
  const [, setNotification] = useNotification();
  const [CurrentValue, setCurrentValue] = useState(value);
  const {
    assets,
    isLoading,
    hasMoreAssets,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
  } = useHooks({ workspaceId: currentWorkspace?.id });

  const {
    localSearchTerm,
    wrapperRef,
    onScrollToBottom,
    sortOptions,
    handleSearchInputChange,
    handleUploadToAsset,
    handleSearch,
  } = useManageAssets({
    selectedAssets,
    searchTerm,
    isLoading,
    hasMoreAssets,
    onGetMore: handleGetMoreAssets,
    onSortChange: handleSortChange,
    onCreateAssets: createAssets,
    onSearch: handleSearchTerm,
  });

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClick = useCallback(() => setOpen(!open), [open]);

  const handleSelect = useCallback(
    (asset?: Asset) => {
      if (!asset) return;
      if (!selectedAssets.includes(asset)) selectAsset([asset]);
      else selectAsset([]);
    },
    [selectedAssets, selectAsset],
  );

  const handleUpload = useCallback(() => {
    handleUploadToAsset();
  }, [handleUploadToAsset]);

  const handleChange = useCallback(
    (inputValue?: string) => {
      if (!inputValue) return;

      if (
        fileType === "asset" &&
        !(checkIfFileType(inputValue, FILE_FORMATS) || checkIfFileType(inputValue, IMAGE_FORMATS))
      ) {
        setNotification({
          type: "error",
          text: t("wrong File URL Format"),
        });
        setCurrentValue(undefined);
        return;
      } else if (fileType === "URL" && !checkIfFileType(inputValue, VIDEO_FORMATS)) {
        setNotification({
          type: "error",
          text: t("wrong Video URL  Format"),
        });
        setCurrentValue(undefined);
        return;
      }

      setCurrentValue(inputValue);
      onChange?.(inputValue);
    },
    [fileType, onChange, setNotification, t],
  );

  return (
    <Property name={name} description={description}>
      <TextInput value={CurrentValue} onChange={handleChange} placeholder={t("Not set")} />
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
            onClick={handleUpload}
          />
        </ButtonWrapper>
      )}
      {open && (
        <ChooseAssetModal
          open={open}
          onClose={handleClose}
          assetType={assetType}
          sortOptions={sortOptions}
          handleSearch={handleSearch}
          handleSearchInputChange={handleSearchInputChange}
          localSearchTerm={localSearchTerm}
          onGetMore={handleGetMoreAssets}
          onScrollToBottom={onScrollToBottom}
          selectedAssets={selectedAssets}
          wrapperRef={wrapperRef}
          assets={assets}
          isLoading={isLoading}
          hasMoreAssets={hasMoreAssets}
          searchTerm={searchTerm}
          onSelectAsset={handleSelect}
          onSelect={handleChange}
          onSortChange={handleSortChange}
        />
      )}
    </Property>
  );
};

const AssetButton = styled(Button)<{ active?: boolean }>`
  cursor: pointer;
  margin-left: 6px;
  padding: 4px;
  border-radius: 6px;
  width: 127px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: stretch;
`;

export default URLField;
