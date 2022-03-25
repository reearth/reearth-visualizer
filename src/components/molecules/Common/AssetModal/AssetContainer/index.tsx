import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import SearchBar from "@reearth/components/atoms/SearchBar";
import Text from "@reearth/components/atoms/Text";
import AssetDeleteModal from "@reearth/components/molecules/Common/AssetModal/AssetDeleteModal";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import AssetCard from "../AssetCard";
import AssetListItem from "../AssetListItem";
import AssetSelect from "../AssetSelect";

import useHooks, { Asset as AssetType, LayoutTypes, SortType } from "./hooks";

export type Asset = AssetType;

export type AssetSortType = SortType;

export type Props = {
  teamId?: string;
  initialAssetUrl?: string | null;
  allowDeletion?: boolean;
  className?: string;
  assets?: Asset[];
  initialAsset?: Asset;
  selectedAssets?: Asset[];
  isLoading?: boolean;
  isMultipleSelectable?: boolean;
  accept?: string;
  fileType?: "image" | "video" | "file";
  height?: number;
  hasMoreAssets?: boolean;
  sort?: { type?: AssetSortType | null; reverse?: boolean };
  searchTerm?: string;
  smallCardOnly?: boolean;
  onCreateAssets?: (files: FileList) => void;
  onRemove?: (assetIds: string[]) => void;
  onGetMore?: () => void;
  onAssetUrlSelect?: (asset?: string) => void;
  onSelect?: (asset?: Asset) => void;
  onSortChange?: (type?: string, reverse?: boolean) => void;
  onSearch?: (term?: string) => void;
  onURLShow?: (assets?: Asset[]) => void;
};

const AssetContainer: React.FC<Props> = ({
  assets,
  isMultipleSelectable = false,
  accept,
  initialAsset,
  selectedAssets,
  fileType,
  height,
  hasMoreAssets,
  isLoading,
  sort,
  searchTerm,
  smallCardOnly,
  onCreateAssets,
  onRemove,
  onGetMore,
  onAssetUrlSelect,
  onSelect,
  onSortChange,
  onSearch,
}) => {
  const intl = useIntl();
  const {
    layoutType,
    iconChoice,
    deleteModalVisible,
    sortOptions,
    handleScroll,
    setLayoutType,
    handleUploadToAsset,
    handleReverse,
    handleSearch,
    setDeleteModalVisible,
    handleRemove,
  } = useHooks({
    sort,
    isMultipleSelectable,
    accept,
    selectedAssets,
    smallCardOnly,
    onSortChange,
    onCreateAssets,
    onAssetUrlSelect,
    onRemove,
    onSearch,
  });

  return (
    <Wrapper>
      <Flex justify={onRemove ? "flex-end" : "center"}>
        <Button
          large
          text={
            fileType === "image"
              ? intl.formatMessage({ defaultMessage: "Upload image" })
              : intl.formatMessage({ defaultMessage: "Upload file" })
          }
          icon="upload"
          type="button"
          buttonType={onRemove ? "secondary" : "primary"}
          onClick={handleUploadToAsset}
        />
        {onRemove && (
          <Button
            large
            text={intl.formatMessage({ defaultMessage: "Delete" })}
            icon="bin"
            type="button"
            buttonType="secondary"
            disabled={selectedAssets?.length ? false : true}
            onClick={() => setDeleteModalVisible(true)}
          />
        )}
      </Flex>
      <Divider margin="0" />
      <NavBar align="center" justify="space-between">
        <SelectWrapper direction="row" justify="space-between" align="center">
          <AssetSelect<AssetSortType>
            value={sort?.type ?? "date"}
            items={sortOptions}
            onChange={onSortChange}
          />
          <StyledIcon icon={iconChoice} onClick={handleReverse} />
        </SelectWrapper>

        <LayoutButtons justify="left">
          <StyledIcon
            icon="assetList"
            onClick={() => setLayoutType("list")}
            selected={layoutType === "list"}
          />
          {smallCardOnly ? (
            <StyledIcon
              icon="assetGridSmall"
              onClick={() => setLayoutType("small")}
              selected={layoutType === "small"}
            />
          ) : (
            <StyledIcon
              icon="assetGrid"
              onClick={() => setLayoutType("medium")}
              selected={layoutType === "medium"}
            />
          )}
        </LayoutButtons>
        <SearchBar value={searchTerm ?? ""} onChange={handleSearch} />
      </NavBar>
      <AssetWrapper height={height}>
        {!isLoading && (!assets || assets.length < 1) ? (
          <Template align="center" justify="center">
            <TemplateText size="m" otherProperties={{ textAlign: "center" }}>
              {searchTerm
                ? intl.formatMessage({
                    defaultMessage: "No assets match your search.",
                  })
                : fileType === "image"
                ? intl.formatMessage({
                    defaultMessage:
                      "You haven't uploaded any image assets yet. Click the upload button above and select an image from your computer.",
                  })
                : intl.formatMessage({
                    defaultMessage:
                      "You haven't uploaded any file assets yet. Click the upload button above and select a compatible file from your computer.",
                  })}
            </TemplateText>
          </Template>
        ) : (
          <AssetListWrapper
            onScroll={e => !isLoading && hasMoreAssets && handleScroll(e, onGetMore)}>
            <AssetList layoutType={layoutType}>
              {layoutType === "list"
                ? assets?.map(a => (
                    <AssetListItem
                      key={a.id}
                      asset={a}
                      onCheck={() => onSelect?.(a)}
                      selected={selectedAssets?.includes(a)}
                      checked={initialAsset === a}
                    />
                  ))
                : assets?.map(a => (
                    <AssetCard
                      key={a.id}
                      name={a.name}
                      cardSize={layoutType}
                      url={a.url}
                      onCheck={() => onSelect?.(a)}
                      selected={selectedAssets?.includes(a)}
                      checked={initialAsset === a}
                    />
                  ))}
            </AssetList>
            {isLoading && <StyledLoading relative />}
          </AssetListWrapper>
        )}
        {assets && assets.length > 0 && (
          <>
            {!hasMoreAssets && !isLoading && <Divider margin="2px" />}
            <Divider margin="0" />
          </>
        )}
      </AssetWrapper>
      <AssetDeleteModal
        isVisible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        handleRemove={handleRemove}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const AssetWrapper = styled.div<{ height?: number }>`
  max-height: ${({ height }) => height ?? ""}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const AssetListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const AssetList = styled.div<{ layoutType?: LayoutTypes }>`
  padding: ${metricsSizes["l"]}px ${metricsSizes["m"]}px;
  display: grid;
  grid-template-columns: ${({ layoutType }) =>
    (layoutType === "list" && "100%") ||
    (layoutType === "medium" && "repeat(auto-fill, 192px)") ||
    (layoutType === "small" && "repeat(auto-fill, 104px)")};
  grid-template-rows: ${({ layoutType }) =>
    (layoutType === "list" && "46px") ||
    (layoutType === "medium" && "repeat(auto-fill, 186px)") ||
    (layoutType === "small" && "repeat(auto-fill, 120px)")};
  gap: ${({ layoutType }) =>
    (layoutType === "list" && "12px") ||
    (layoutType === "medium" && "24px") ||
    (layoutType === "small" && "16px")};
  justify-content: space-between;
`;

const NavBar = styled(Flex)`
  margin: ${metricsSizes["m"]}px;
  flex: 1;
`;

const SelectWrapper = styled(Flex)`
  flex: 2;
`;

const LayoutButtons = styled(Flex)`
  margin-left: ${metricsSizes["l"]}px;
  flex: 3;
`;

const StyledIcon = styled(Icon)<{ selected?: boolean }>`
  margin-left: ${metricsSizes["m"]}px;
  border-radius: 5px;
  padding: ${metricsSizes["2xs"]}px;
  color: ${({ selected, theme }) => (selected ? theme.main.text : theme.main.weak)};
  cursor: pointer;
  ${({ selected, theme }) => selected && `background: ${theme.main.paleBg};`}

  &:hover {
    background: ${({ theme }) => theme.main.paleBg};
    color: ${({ theme }) => theme.main.text};
  }
`;

const StyledLoading = styled(Loading)`
  margin: 52px auto;
`;

const Template = styled(Flex)`
  height: 458px;
`;

const TemplateText = styled(Text)`
  width: 390px;
`;

export default AssetContainer;
