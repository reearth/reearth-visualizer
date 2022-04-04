import React, { useCallback, useState, useEffect, ComponentType } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Modal from "@reearth/components/atoms/Modal";
import TabularModal from "@reearth/components/atoms/TabularModal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import {
  Asset as AssetType,
  AssetSortType as SortType,
  Props as AssetContainerProps,
} from "./AssetContainer";

export type Mode = "asset" | "url";
export type Asset = AssetType;
export type AssetSortType = SortType;

export type Props = {
  className?: string;
  teamId?: string;
  initialAssetUrl?: string | null;
  videoOnly?: boolean;
  isOpen?: boolean;
  onSelect?: (value?: string) => void;
  toggleAssetModal?: (b: boolean) => void;
  assetContainer?: ComponentType<AssetContainerProps>;
};

type Tabs = "assets" | "url";

const AssetModal: React.FC<Props> = ({
  teamId,
  initialAssetUrl,
  videoOnly,
  isOpen,
  onSelect,
  toggleAssetModal,
  assetContainer: AssetContainer,
}) => {
  const intl = useIntl();
  const [showURL, setShowURL] = useState(false);
  const [selectedTab, selectTab] = useState<Tabs>("assets");
  const [textUrl, setTextUrl] = useState(showURL && initialAssetUrl ? initialAssetUrl : undefined);
  const [selectedAssetUrl, selectAssetUrl] = useState(initialAssetUrl ?? undefined);

  const labels: { [t in Tabs]: string } = {
    assets: intl.formatMessage({ defaultMessage: "Assets Library" }),
    url: intl.formatMessage({ defaultMessage: "Use URL" }),
  };

  const handleShowURL = useCallback(
    (assets?: AssetType[]) => {
      setShowURL(
        videoOnly || !!(selectedAssetUrl && !assets?.some(e => e.url === selectedAssetUrl)),
      );
    },
    [videoOnly, selectedAssetUrl],
  );

  const handleTextUrlChange = useCallback(text => {
    setTextUrl(text);
  }, []);

  const handleSave = useCallback(() => {
    onSelect?.((selectedTab === "url" || videoOnly ? textUrl : selectedAssetUrl) || undefined);
    toggleAssetModal?.(false);
  }, [toggleAssetModal, selectedAssetUrl, selectedTab, onSelect, videoOnly, textUrl]);

  const resetValues = useCallback(() => {
    setTextUrl(showURL && initialAssetUrl ? initialAssetUrl : undefined);
    selectTab("assets");
    selectAssetUrl(initialAssetUrl ?? undefined);
  }, [showURL, initialAssetUrl]);

  const handleModalClose = useCallback(() => {
    resetValues();
    toggleAssetModal?.(false);
  }, [toggleAssetModal, resetValues]);

  useEffect(() => {
    resetValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAssetUrl, showURL]);

  return videoOnly ? (
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
          onClick={handleSave}
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
      title={intl.formatMessage({ defaultMessage: "Select Asset" })}
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
          onClick={handleSave}
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
      {selectedTab === "assets" && AssetContainer && (
        <AssetContainer
          teamId={teamId}
          initialAssetUrl={initialAssetUrl}
          onAssetUrlSelect={selectAssetUrl}
          smallCardOnly
          height={425}
          onURLShow={handleShowURL}
        />
      )}
      {selectedTab === "url" && (
        <TextContainer align="center">
          <Title size="s">{intl.formatMessage({ defaultMessage: "Resource URL" })}</Title>
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
