import { useEffect, useRef } from "react";

import Button from "@reearth/beta/components/Button";
import Loading from "@reearth/beta/components/Loading";
import Text from "@reearth/beta/components/Text";
import { autoFillPage, onScrollToBottom } from "@reearth/classic/util/infinite-scroll";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import AssetCard from "../AssetCard";
import AssetDeleteModal from "../AssetDeleteModal";
// import AssetSelect from "../AssetSelect";

import useHooks, {
  Asset as AssetType,
  LayoutTypes,
  SortType,
  fileFormats,
  imageFormats,
} from "./hooks";

export type Asset = AssetType;

export type AssetSortType = SortType;

export type Props = {
  workspaceId?: string;
  allowDeletion?: boolean;
  className?: string;
  assets?: Asset[];
  selectedAssets?: Asset[];
  isLoading?: boolean;
  isMultipleSelectable?: boolean;
  videoOnly?: boolean;
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
};

const AssetContainer: React.FC<Props> = ({
  assets,
  isMultipleSelectable = false,
  selectedAssets,
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
  const t = useT();
  const {
    layoutType,
    // iconChoice,
    deleteModalVisible,
    // sortOptions,
    localSearchTerm,
    handleSearchInputChange,
    handleUploadToAsset,
    // handleReverse,
    handleSearch,
    openDeleteModal,
    closeDeleteModal,
    handleRemove,
  } = useHooks({
    sort,
    isMultipleSelectable,
    selectedAssets,
    smallCardOnly,
    searchTerm,
    onSortChange,
    onCreateAssets,
    onAssetUrlSelect,
    onRemove,
    onSearch,
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current && !isLoading && hasMoreAssets) autoFillPage(wrapperRef, onGetMore);
  }, [hasMoreAssets, isLoading, onGetMore]);

  return (
    <Wrapper>
      <NavBar>
        <LeftSection>
          <SearchWarper>
            <StyledSearchInput value={localSearchTerm} onChange={handleSearchInputChange} />
            <Button size="small" icon="search" margin="0" onClick={() => handleSearch()} />
          </SearchWarper>
          {/* <AssetSelect<AssetSortType>
            value={sort?.type ?? "date"}
            items={sortOptions}
            onChange={onSortChange}
          />
          <StyledIcon icon={iconChoice} onClick={handleReverse} /> */}
        </LeftSection>
        <RightSection>
          <Button
            text={t("Upload file")}
            icon="uploadSimple"
            size="small"
            buttonType={"secondary"}
            onClick={handleUploadToAsset}
          />
          <Button
            text={t("Delete")}
            icon="bin"
            size="small"
            buttonType="secondary"
            disabled={selectedAssets?.length ? false : true}
            onClick={openDeleteModal}
          />
        </RightSection>
      </NavBar>

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
            onScroll={e => !isLoading && hasMoreAssets && onScrollToBottom(e, onGetMore)}>
            <AssetList layoutType={layoutType}>
              {assets?.map(a => (
                <AssetCard
                  key={a.id}
                  name={a.name}
                  icon={
                    checkIfFileType(a.url, fileFormats)
                      ? "file"
                      : checkIfFileType(a.url, imageFormats)
                      ? undefined
                      : "assetNoSupport"
                  }
                  url={a.url}
                  onSelect={() => onSelect?.(a)}
                  selected={selectedAssets?.includes(a)}
                />
              ))}
            </AssetList>
            {isLoading && <Loading />}
          </AssetListWrapper>
        )}
      </AssetWrapper>
      <AssetDeleteModal
        isVisible={deleteModalVisible}
        onClose={closeDeleteModal}
        handleRemove={handleRemove}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 20px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const NavBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.smallest}px;
`;

const RightSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.smallest}px;
  flex-grow: 0;
`;

const SearchWarper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.micro}px;
`;

const StyledSearchInput = styled.input`
  outline: none;
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 4px 8px;
  transition: all 0.3s;

  :focus {
    border-color: ${({ theme }) => theme.outline.main};
  }
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
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, 148px);
  grid-template-rows: repeat(auto-fill, 119px);
  gap: ${({ theme }) => theme.spacing.normal}px;
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

export default AssetContainer;

function checkIfFileType(url: string, fileTypes: string) {
  const formats = fileTypes.split(/,.|\./).splice(1);
  let regexString = "\\.(";

  for (let i = 0; i < formats.length; i++) {
    if (i === formats.length - 1) {
      regexString += formats[i];
    } else {
      regexString += formats[i] + "|";
    }
  }
  regexString += ")$";

  const regex = new RegExp(regexString);

  return regex.test(url);
}
