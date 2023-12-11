import React, { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth/beta/components/Button";
import AssetCard from "@reearth/beta/components/CatalogCard";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import SelectField from "@reearth/beta/components/fields/SelectField";
import Loading from "@reearth/beta/components/Loading";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import useHooks from "@reearth/beta/features/Assets/hooks";
import { AcceptedFileFormat, Asset } from "@reearth/beta/features/Assets/types";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { useNotification, Workspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

const getValue: { [key: string]: string } = {
  "date-reverse": "date",
  "name-reverse": "name",
  "size-reverse": "size",
  date: "date",
  size: "size",
  name: "name",
};

export type Props = {
  className?: string;
  assetType?: "file" | "image";
  open?: boolean;
  onSelect?: (value: string, name: string) => void;
  currentWorkspace?: Workspace;
  currentValue?: string;
  onModalClose: () => void;
  fileFormat?: AcceptedFileFormat;
};

const ChooseAssetModal: React.FC<Props> = ({
  className,
  currentWorkspace,
  currentValue,
  assetType,
  open,
  fileFormat,
  onSelect,
  onModalClose,
}) => {
  const t = useT();

  const [, setNotification] = useNotification();
  const [selectedSortOption, setSelectedSortOption] = useState("date");
  const {
    assets,
    isAssetsLoading,
    hasMoreAssets,
    searchTerm,
    selectedAssets,
    localSearchTerm,
    assetsWrapperRef,
    sortOptions,
    onScrollToBottom,
    selectAsset,
    handleSearchInputChange,
    handleSearch,
    handleGetMoreAssets,
    handleSortChange,
  } = useHooks({ workspaceId: currentWorkspace?.id });

  const filteredAssets = useMemo(() => {
    if (!assetType) {
      return assets;
    }

    return assets?.filter(asset => {
      const isFile = checkIfFileType(asset.url, FILE_FORMATS);
      const isImage = checkIfFileType(asset.url, IMAGE_FORMATS);

      if (assetType === "file" && isFile) {
        const assetFileFormat = asset.url.split(".").pop()?.toLowerCase();
        return assetFileFormat === fileFormat?.toLocaleLowerCase();
      } else {
        return assetType === "image" && isImage;
      }
    });
  }, [assetType, assets, fileFormat]);

  const handleReset = useCallback(() => {
    const selectedAsset = assets?.find(a => a.url === currentValue);
    if (selectedAsset) {
      selectAsset([selectedAsset]);
    }
  }, [currentValue, assets, selectAsset]);

  const onClose = useCallback(() => {
    onModalClose();
    handleReset();
  }, [handleReset, onModalClose]);

  const handleSelectButtonClick = useCallback(() => {
    if (selectedAssets && selectedAssets.length > 0) {
      onSelect?.(selectedAssets[0].url, selectedAssets[0].name);
      onClose?.();
    } else {
      setNotification({
        type: "warning",
        text: t("Please select an asset before clicking Select."),
      });
    }
  }, [onClose, onSelect, selectedAssets, setNotification, t]);

  const onSelectAsset = useCallback(
    (asset?: Asset) => {
      if (!asset) return;
      selectAsset(!selectedAssets.includes(asset) ? [asset] : []);
    },
    [selectedAssets, selectAsset],
  );
  const onSortChange = useCallback(
    (selectedLabel: string) => {
      setSelectedSortOption(selectedLabel);
      const value = getValue[selectedLabel];
      const reverse = selectedLabel.toLowerCase().includes("reverse");
      handleSortChange?.(value, reverse);
    },
    [handleSortChange],
  );

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <Modal
      title={t("Select Image")}
      className={className}
      isVisible={open}
      onClose={onClose}
      size="lg"
      button1={
        <Button
          size="medium"
          buttonType="secondary"
          text={t("Cancel")}
          onClick={() => onClose?.()}
        />
      }
      button2={
        <Button
          size="medium"
          buttonType="primary"
          text={t("Select")}
          onClick={() => {
            handleSelectButtonClick();
          }}
        />
      }>
      <ControlWarpper>
        <SortWrapper>
          <Text size="xFootnote">{t("Sort By")}</Text>
          <SelectField
            value={selectedSortOption}
            options={sortOptions.map(option => ({
              key: option.key,
              label: option.label,
            }))}
            onChange={onSortChange}
          />
        </SortWrapper>
        <SearchWarpper>
          <TextInput value={localSearchTerm} onChange={handleSearchInputChange} />
          <SearchButton icon="search" margin="0" onClick={handleSearch} />
        </SearchWarpper>
      </ControlWarpper>
      <AssetWrapper>
        {!isAssetsLoading && (!assets || assets.length < 1) ? (
          <Template>
            <TemplateText size="body">
              {searchTerm
                ? t("No assets match your search.")
                : t(
                    "You haven't uploaded any assets yet. Click the upload button above and select a compatible file from your computer.",
                  )}
            </TemplateText>
          </Template>
        ) : (
          <AssetListWrapper
            ref={assetsWrapperRef}
            onScroll={e =>
              !isAssetsLoading && hasMoreAssets && onScrollToBottom?.(e, handleGetMoreAssets)
            }>
            <AssetList>
              {filteredAssets?.map(a => (
                <AssetCard
                  key={a.id}
                  name={a.name}
                  icon={
                    checkIfFileType(a.url, FILE_FORMATS)
                      ? "file"
                      : checkIfFileType(a.url, IMAGE_FORMATS)
                      ? undefined
                      : "assetNoSupport"
                  }
                  url={a.url}
                  onSelect={() => onSelectAsset?.(a)}
                  selected={selectedAssets?.includes(a)}
                />
              ))}
            </AssetList>
            {isAssetsLoading && <Loading />}
          </AssetListWrapper>
        )}
      </AssetWrapper>
    </Modal>
  );
};

const AssetWrapper = styled.div`
  max-height: 531px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ControlWarpper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const SortWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  left: 0px;
`;

const SearchWarpper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  right: 0;
`;

const SearchButton = styled(Button)`
  width: 12px;
  height: 28px;
`;

const AssetListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const AssetList = styled.div`
  margin-right: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 114px);
  grid-template-rows: repeat(auto-fill, 119px);
  gap: ${({ theme }) => theme.spacing.small}px;
  justify-content: space-between;
  min-height: 373px;
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 373px;
`;

const TemplateText = styled(Text)`
  text-align: center;
  width: 390px;
`;
export default ChooseAssetModal;
