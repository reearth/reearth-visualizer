import React, { useState } from "react";
import AssetContainer from "@reearth/components/molecules/Common/AssetModal/AssetContainer";

type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

type Props = {
  assets?: Asset[];
  onCreate?: (files: FileList) => void;
  onRemove?: (assetIds: string[]) => void;
};

const AssetSection: React.FC<Props> = ({ assets = [], onCreate, onRemove }) => {
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  return (
    <AssetContainer
      assets={assets}
      onCreateAsset={onCreate}
      onRemove={onRemove}
      selectedAssets={selectedAssets}
      isMultipleSelectable
      selectAsset={selectAsset}
      isHeightFixed={true}
    />
  );
};

export default AssetSection;
