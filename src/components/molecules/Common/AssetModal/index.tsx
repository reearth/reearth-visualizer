import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Modal from "@reearth/components/atoms/Modal";
import TabularModal from "@reearth/components/atoms/TabularModal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import AssetsContainer, { Asset as AssetType } from "./AssetContainer";

export type Mode = "asset" | "url";

export type Asset = AssetType;

export type Props = {
  className?: string;
  assets?: Asset[];
  isMultipleSelectable?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onCreateAsset?: (files: FileList) => void;
  onSelect?: (value: string | null) => void;
  value?: string;
  fileType?: "image" | "video";
};

type Tabs = "assets" | "url";

const AssetModal: React.FC<Props> = ({
  assets,
  isMultipleSelectable = false,
  isOpen,
  onClose,
  onCreateAsset,
  onSelect,
  value,
  fileType,
}) => {
  const intl = useIntl();
  const labels: { [t in Tabs]: string } = {
    assets: intl.formatMessage({ defaultMessage: "Assets Library" }),
    url: intl.formatMessage({ defaultMessage: "Use URL" }),
  };
  const showURL = fileType === "video" || (value && !assets?.some(e => e.url === value));

  const [selectedTab, selectTab] = useState<Tabs>(showURL ? "url" : "assets");

  const initialAsset = assets?.find(a => a.url === value);

  const [selectedAssets, selectAsset] = useState<Asset[]>(initialAsset ? [initialAsset] : []);
  const [textUrl, setTextUrl] = useState(showURL ? value : undefined);
  const accept =
    fileType === "image"
      ? "image/*"
      : fileType === "video"
      ? "video/*"
      : fileType
      ? "*/*"
      : undefined;

  const handleSetUrl = useCallback(() => {
    onSelect?.(
      (selectedTab === "url" || fileType === "video" ? textUrl : selectedAssets[0]?.url) || null,
    );
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, selectedAssets, selectedTab, onSelect, fileType, textUrl]);

  const handleTextUrlChange = useCallback(text => {
    setTextUrl(text);
  }, []);

  const resetValues = useCallback(() => {
    setTextUrl(showURL ? value : undefined);
    selectTab(showURL ? "url" : "assets");
    selectAsset(initialAsset ? [initialAsset] : []);
  }, [value, showURL, initialAsset]);

  const handleModalClose = useCallback(() => {
    resetValues();
    onClose?.();
  }, [onClose, resetValues]);

  useEffect(() => {
    resetValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAsset, showURL, value]);

  const filteredAssets = useMemo(() => {
    if (!assets) return;
    return assets
      .filter(
        a =>
          !fileType ||
          a.url.match(fileType === "image" ? /\.(jpg|jpeg|png|gif|webp)$/ : /\.(mp4|webm)$/),
      )
      .reverse(); // reversed to show newest at the top
  }, [assets, fileType]);

  return fileType === "video" ? (
    <Modal
      size="sm"
      title={intl.formatMessage({ defaultMessage: "Add video URL" })}
      isVisible={isOpen}
      onClose={handleModalClose}
      button1={
        <Button
          large
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Save" })}
          onClick={handleSetUrl}
        />
      }
      button2={
        <Button
          large
          buttonType="secondary"
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={handleModalClose}
        />
      }>
      <Wrapper>
        <StyledTextField value={textUrl} onChange={handleTextUrlChange} />
      </Wrapper>
    </Modal>
  ) : (
    <TabularModal<Tabs>
      title={
        fileType === "image"
          ? intl.formatMessage({ defaultMessage: "Select Image" })
          : intl.formatMessage({ defaultMessage: "Select Resource" })
      }
      isVisible={isOpen}
      size="lg"
      onClose={handleModalClose}
      tabs={["assets", "url"]}
      tabLabels={labels}
      currentTab={selectedTab}
      setCurrentTab={selectTab}
      button1={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Select" })}
          buttonType="primary"
          onClick={handleSetUrl}
        />
      }
      button2={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          buttonType="secondary"
          onClick={handleModalClose}
        />
      }>
      {selectedTab === "assets" && (
        <AssetsContainer
          assets={filteredAssets}
          isMultipleSelectable={isMultipleSelectable}
          accept={accept}
          onCreateAsset={onCreateAsset}
          initialAsset={initialAsset}
          selectedAssets={selectedAssets}
          selectAsset={selectAsset}
          fileType={fileType}
        />
      )}
      {selectedTab === "url" && (
        <TextContainer align="center">
          <Title size="s">
            {fileType === "image"
              ? intl.formatMessage({ defaultMessage: "Image URL" })
              : intl.formatMessage({ defaultMessage: "Resource URL" })}
          </Title>
          <StyledTextField value={textUrl} onChange={handleTextUrlChange} />
        </TextContainer>
      )}
    </TabularModal>
  );
};

const TextContainer = styled(Flex)`
  align-items: center;
  width: 100%;
  margin: ${metricsSizes["xl"]}px;
`;

const Wrapper = styled.div`
  width: 100%;
`;

const Title = styled(Text)`
  margin: ${metricsSizes["m"]}px;
  flex: 1;
`;

const StyledTextField = styled(TextBox)`
  flex: 3;
`;

export default AssetModal;
