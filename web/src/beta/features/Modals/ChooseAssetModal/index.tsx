import React, { useCallback, useMemo, useState } from "react";

import Button from "@reearth/beta/components/Button";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import SelectField from "@reearth/beta/components/fields/SelectField";
import Loading from "@reearth/beta/components/Loading";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import AssetCard from "@reearth/beta/features/Assets/AssetCard";
import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import { Asset } from "@reearth/beta/features/Assets/types";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
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
  assets?: Asset[];
  selectedAssets?: Asset[];
  isLoading?: boolean;
  hasMoreAssets?: boolean;
  searchTerm?: string;
  open?: boolean;
  workspaceId?: string;
  localSearchTerm?: string;
  wrapperRef?: React.RefObject<HTMLDivElement>;
  sortOptions: {
    key: string;
    label: string;
  }[];
  onGetMore?: () => void;
  onSelectAsset?: (asset?: Asset) => void;
  onSelect?: (value: string) => void;
  onSortChange?: (type?: string, reverse?: boolean) => void;
  onClose: () => void;
  onScrollToBottom?: (
    { currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>,
    onLoadMore?: (() => void) | undefined,
    threshold?: number,
  ) => void;
  handleSearchInputChange?: (value: string) => void;
  handleSearch?: () => void;
};

const ChooseAssetModal: React.FC<Props> = ({
  className,
  assetType,
  open,
  assets,
  selectedAssets,
  hasMoreAssets,
  isLoading,
  searchTerm,
  localSearchTerm,
  wrapperRef,
  sortOptions,
  onClose,
  onGetMore,
  onSelect,
  onSelectAsset,
  onSortChange,
  onScrollToBottom,
  handleSearchInputChange,
  handleSearch,
}) => {
  const t = useT();
  const [selectedSortOption, setSelectedSortOption] = useState("Last Uploaded");
  const [reverseSort, setReverseSort] = useState(false);
  const [, setNotification] = useNotification();

  const filteredAssets = useMemo(() => {
    if (!assetType) {
      return assets;
    }
    return assets?.filter(asset => {
      const isFile = checkIfFileType(asset.url, FILE_FORMATS);
      const isImage = checkIfFileType(asset.url, IMAGE_FORMATS);
      return (assetType === "file" && isFile) || (assetType === "image" && isImage);
    });
  }, [assetType, assets]);

  const handleSortChange = useCallback(
    (selectedLabel: string) => {
      setSelectedSortOption(selectedLabel);
      const value = getValue[selectedLabel];
      const reverse = selectedLabel.toLowerCase().includes("reverse");
      setReverseSort(reverse);
      onSortChange?.(value, reverseSort);
    },
    [onSortChange, reverseSort],
  );

  const handleSelectButtonClick = useCallback(() => {
    if (selectedAssets && selectedAssets.length > 0) {
      onSelect?.(selectedAssets[0].url);
      onClose?.();
    } else {
      setNotification({
        type: "warning",
        text: t("Please select an asset before clicking Select."),
      });
    }
  }, [onClose, onSelect, selectedAssets, setNotification, t]);

  return (
    <StyledModal
      title={t("Select Image")}
      className={className}
      isVisible={open}
      onClose={onClose}
      button1={
        <Button
          size="medium"
          buttonType="primary"
          text={t("Select")}
          onClick={() => {
            handleSelectButtonClick();
          }}
        />
      }
      button2={
        <Button
          size="medium"
          buttonType="secondary"
          text={t("Cancel")}
          onClick={() => onClose?.()}
        />
      }>
      <ControlWarper>
        <SortWrapper>
          <Text size="xFootnote">Sort By</Text>
          <SelectField
            value={selectedSortOption}
            options={sortOptions.map(option => ({
              key: option.key,
              label: option.label,
            }))}
            onChange={handleSortChange}
          />
        </SortWrapper>
        <SearchWarper>
          <TextInput value={localSearchTerm} onChange={handleSearchInputChange} />
          <SearchButton icon="search" margin="0" onClick={() => handleSearch?.()} />
        </SearchWarper>
      </ControlWarper>
      <AssetWrapper>
        {!isLoading && (!assets || assets.length < 1) ? (
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
            ref={wrapperRef}
            onScroll={e => !isLoading && hasMoreAssets && onScrollToBottom?.(e, onGetMore)}>
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
            {isLoading && <Loading />}
          </AssetListWrapper>
        )}
      </AssetWrapper>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  width: 730px;
  height: 421px;
`;
const AssetWrapper = styled.div`
  max-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ControlWarper = styled.div`
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

const SearchWarper = styled.div`
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
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  :hover::-webkit-scrollbar {
    display: block;
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
    background-color: ${({ theme }) => theme.bg[1]};
    width: 8px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: ${({ theme }) => theme.bg[2]};
  }
`;

const AssetList = styled.div`
  margin-right: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 114px);
  grid-template-rows: repeat(auto-fill, 119px);
  gap: ${({ theme }) => theme.spacing.small}px;
  justify-content: space-between;
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 458px;
`;

const TemplateText = styled(Text)`
  text-align: center;
  width: 390px;
`;
export default ChooseAssetModal;
