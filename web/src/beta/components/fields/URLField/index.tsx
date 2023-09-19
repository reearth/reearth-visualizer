import React, { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Property from "@reearth/beta/components/fields";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import useHooks from "@reearth/beta/features/Assets/AssetsQueriesHook/hooks";
import { Asset } from "@reearth/beta/features/Assets/types";
import { useManageAssets } from "@reearth/beta/features/Assets/useManageAssets/hooks";
import ChooseAssetModal from "@reearth/beta/features/Modals/ChooseAssetModal";
import { useT } from "@reearth/services/i18n";
import { useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

export type Props = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  name?: string;
  description?: string;
  fileType?: "Asset" | "URL";
  assetType?: "Image" | "File";
};

const URLField: React.FC<Props> = ({ name, description, value, fileType, assetType, onChange }) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [currentWorkspace] = useWorkspace();

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
  const handleChange = useCallback(
    (value?: string) => {
      if (!value) return;
      onChange?.(value);
    },
    [onChange],
  );

  return (
    <Property name={name} description={description}>
      <StyledTextField
        value={value !== null ? t("Field set") : undefined}
        onChange={onChange}
        placeholder={t("Not set")}
      />
      {fileType === "Asset" && (
        <ButtonWrapper>
          <AssetButton
            icon={assetType === "Image" ? "imageStoryBlock" : "file"}
            text={t("Choose")}
            iconPosition="left"
            onClick={handleClick}
          />
          <AssetButton
            icon="uploadSimple"
            text={t("Upload")}
            iconPosition="left"
            onClick={handleUploadToAsset}
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
  color: ${props => props.theme.classic.main.text};

  &:hover {
    background: ${props => props.theme.classic.main.bg};
  }
`;

const StyledTextField = styled(TextInput)<{ canUpload?: boolean }>``;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: stretch;
`;

export default URLField;
