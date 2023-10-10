import React, { useCallback, useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import Loading from "@reearth/beta/components/Loading";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import AssetCard from "@reearth/beta/features/Assets/AssetCard";
import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import { Asset } from "@reearth/beta/features/Assets/types";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

export type Props = {
  className?: string;
  assetType?: "appearance" | "image" | "file";
  assets?: Asset[];
  appearances?: NLSAppearance[];
  selectedAssets?: Asset[];
  selectedAppearances?: NLSAppearance[];
  isLoading?: boolean;
  hasMoreAssets?: boolean;
  searchTerm?: string;
  open?: boolean;
  workspaceId?: string;
  localSearchTerm?: string;
  wrapperRef?: React.RefObject<HTMLDivElement>;
  onGetMore?: () => void;
  onSelectAsset?: (asset?: Asset) => void;
  onSelectAppearance?: (appearance?: NLSAppearance) => void;
  onSelect?: (value: string) => void;
  onClose: () => void;
  onScrollToBottom?: (
    event: React.UIEvent<HTMLDivElement, UIEvent>,
    onLoadMore?: (() => void) | undefined,
    threshold?: number,
  ) => void;
  handleSearchInputChange?: (value: string) => void;
  handleSearch?: () => void;
};

const ChooseAssetModal: React.FC<Props> = ({
  className,
  open,
  assetType = "image",
  assets = [],
  appearances = [],
  selectedAssets = [],
  selectedAppearances = [],
  isLoading,
  hasMoreAssets,
  searchTerm,
  localSearchTerm,
  wrapperRef,
  onClose,
  onGetMore,
  onSelect,
  onSelectAsset,
  onSelectAppearance,
  onScrollToBottom,
  handleSearchInputChange,
  handleSearch,
}) => {
  const t = useT();
  const [, setNotification] = useNotification();

  // Unified assets based on assetType
  const unifiedAssets = useMemo(
    () => (assetType === "appearance" ? appearances : assets),
    [appearances, assets, assetType],
  );

  // Unified selection based on assetType
  const unifiedSelectedAssets = useMemo(
    () => (assetType === "appearance" ? selectedAppearances : selectedAssets),
    [selectedAppearances, selectedAssets, assetType],
  );

  const handleSelectButtonClick = useCallback(() => {
    if (unifiedSelectedAssets && unifiedSelectedAssets.length > 0) {
      onSelect?.(
        assetType === "appearance" ? unifiedSelectedAssets[0].id : unifiedSelectedAssets[0].name,
      );
      onClose?.();
    } else {
      setNotification({
        type: "warning",
        text: t("Please select an asset before clicking Select."),
      });
    }
  }, [unifiedSelectedAssets, onSelect, assetType, onClose, setNotification, t]);

  return (
    <StyledModal
      title={t("Select Asset")}
      className={className}
      isVisible={open}
      onClose={onClose}
      button1={
        <Button
          size="medium"
          buttonType="primary"
          text={t("Select")}
          onClick={handleSelectButtonClick}
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
      <ControlWarpper>
        <SearchWarpper>
          <TextInput value={localSearchTerm} onChange={handleSearchInputChange} />
          <SearchButton icon="search" margin="0" onClick={handleSearch} />
        </SearchWarpper>
      </ControlWarpper>
      <AssetWrapper>
        {!isLoading && (!unifiedAssets || unifiedAssets.length < 1) ? (
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
              {unifiedAssets.map(a => (
                <AssetCard
                  key={a.id}
                  name={a.name}
                  icon={
                    assetType === "appearance"
                      ? "appearance"
                      : checkIfFileType((a as Asset).url, FILE_FORMATS)
                      ? "file"
                      : checkIfFileType((a as Asset).url, IMAGE_FORMATS)
                      ? undefined
                      : "assetNoSupport"
                  }
                  onSelect={() =>
                    assetType === "appearance"
                      ? onSelectAppearance?.(a as NLSAppearance)
                      : onSelectAsset?.(a as Asset)
                  }
                  selected={unifiedSelectedAssets.some(ua => ua.id === a.id)}
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
`;
const AssetWrapper = styled.div`
  max-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ControlWarpper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;

const SearchWarpper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SearchButton = styled(Button)`
  width: 12px;
  height: 28px;
`;

const AssetListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
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
