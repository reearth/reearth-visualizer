import React, { useCallback, useEffect, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Property from "@reearth/beta/components/fields";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import useAssetHooks from "@reearth/beta/features/Assets/AssetsQueriesHook/hooks";
import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import useLayerStyleHooks from "@reearth/beta/features/LayerStyle/hooks";
import ChooseAssetModal from "@reearth/beta/features/Modals/ChooseAssetModal";
import ChooseLayerStyleModal from "@reearth/beta/features/Modals/ChooseLayerStyleModal";
import { onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { useNotification, useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

export type Props = {
  value?: string;
  name?: string;
  description?: string;
  fileType?: "asset" | "URL" | "layerStyle";
  entityType?: "image" | "file" | "layerStyle";
  sceneId?: string;
  onChange?: (value: string | undefined) => void;
};

const URLField: React.FC<Props> = ({
  name,
  description,
  value,
  fileType,
  entityType,
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
    assetsWrapperRef,
    isAssetsLoading,
    hasMoreAssets,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    handleFileSelect,
    handleSearchTerm,
    handleSelectAsset,
  } = useAssetHooks({
    workspaceId: currentWorkspace?.id,
    onAssetSelect: handleChange,
  });

  const {
    layerStyles,
    layerStylesWrapperRef,
    selectedLayerStyles,
    isLayerStylesLoading,
    selectLayerStyle,
    handleSelectLayerStyle,
  } = useLayerStyleHooks({ sceneId });

  const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm ?? "");
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);
    },
    [setLocalSearchTerm],
  );

  const handleSearch = useCallback(() => {
    if (!localSearchTerm || localSearchTerm.length < 1) {
      handleSearchTerm?.(undefined);
    } else {
      handleSearchTerm?.(localSearchTerm);
    }
  }, [handleSearchTerm, localSearchTerm]);

  const handleReset = useCallback(() => {
    const selectedAsset = assets?.find(a => a.url === currentValue);
    const selectedLayerStyle = layerStyles?.find(a => a.name === currentValue);
    if (selectedAsset) {
      selectAsset([selectedAsset]);
    }
    if (selectedLayerStyle) {
      selectLayerStyle([selectedLayerStyle]);
    }
  }, [assets, layerStyles, currentValue, selectAsset, selectLayerStyle]);

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

  return (
    <Property name={name} description={description}>
      <TextInput value={currentValue} onChange={handleChange} placeholder={t("Not set")} />
      {fileType === "asset" && (
        <ButtonWrapper>
          <SelectionButton
            icon={entityType === "image" ? "imageStoryBlock" : "file"}
            text={t("Choose")}
            iconPosition="left"
            onClick={handleClick}
          />
          <SelectionButton
            icon="uploadSimple"
            text={t("Upload")}
            iconPosition="left"
            onClick={handleFileSelect}
          />
        </ButtonWrapper>
      )}
      {fileType === "layerStyle" && <SelectionButton icon="layerStyle" onClick={handleClick} />}
      {open && entityType !== "layerStyle" && (
        <ChooseAssetModal
          open={open}
          assetType={entityType}
          localSearchTerm={localSearchTerm}
          selectedAssets={selectedAssets}
          wrapperRef={assetsWrapperRef}
          assets={assets}
          isLoading={isAssetsLoading}
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
      {open && entityType === "layerStyle" && (
        <ChooseLayerStyleModal
          open={open}
          layerStyles={layerStyles}
          localSearchTerm={localSearchTerm}
          selectedLayerStyles={selectedLayerStyles}
          wrapperRef={layerStylesWrapperRef}
          isLoading={isLayerStylesLoading}
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

const SelectionButton = styled(Button)<{ active?: boolean }>`
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
