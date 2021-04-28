import React, { useCallback } from "react";
import { styled } from "@reearth/theme";

import AssetCard from "@reearth/components/atoms/AssetCard";
import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import useFileInput from "use-file-input";
import { useIntl } from "react-intl";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

export type Props = {
  className?: string;
  assets?: Asset[];
  isMultipleSelectable?: boolean;
  accept?: string;
  onCreateAsset?: (file: File) => void;
  selectedAssets?: Asset[];
  selectAsset?: (assets: Asset[]) => void;
  fileType?: "image" | "video" | "file";
};

const AssetContainer: React.FC<Props> = ({
  assets,
  isMultipleSelectable = false,
  onCreateAsset,
  accept,
  selectedAssets,
  selectAsset,
  fileType,
}) => {
  const intl = useIntl();

  const handleAssetsSelect = (asset: Asset) => {
    selectedAssets?.includes(asset)
      ? selectAsset?.(selectedAssets?.filter(a => a !== asset))
      : selectAsset?.(
          isMultipleSelectable && selectedAssets ? [...selectedAssets, asset] : [asset],
        );
  };

  const handleFileSelect = useFileInput(files => onCreateAsset?.(files[0]), {
    accept,
    multiple: isMultipleSelectable,
  });

  const handleUploadToAsset = useCallback(() => {
    handleFileSelect();
  }, [handleFileSelect]);

  return (
    <Wrapper>
      <StyledUploadButton
        large
        text={
          fileType === "image"
            ? intl.formatMessage({ defaultMessage: "Upload image" })
            : intl.formatMessage({ defaultMessage: "Upload file" })
        }
        icon="upload"
        type="button"
        buttonType="primary"
        onClick={handleUploadToAsset}
      />
      <Divider margin="0" />
      <AssetWrapper>
        {assets?.map(a => (
          <AssetCard
            key={a.id}
            name={a.name}
            cardSize={"small"}
            url={a.url}
            isImage={fileType === "image"}
            onCheck={() => handleAssetsSelect(a)}
            checked={selectedAssets?.includes(a)}
          />
        ))}
      </AssetWrapper>
      <Divider margin="0" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 558px;
  width: 100%;
`;

const AssetWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 458px;
  overflow-y: scroll;
  margin: 10px 0;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &::after {
    content: "";
    flex: auto;
  }
`;

const StyledUploadButton = styled(Button)`
  margin: 0 auto 15px auto;
`;

export default AssetContainer;
