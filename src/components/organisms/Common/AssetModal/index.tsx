import React from "react";

import MoleculeAssetModal, {
  Props as PropsType,
} from "@reearth/components/molecules/Common/AssetModal";

import AssetContainer from "../AssetContainer";

export type Props = PropsType;

const AssetModal: React.FC<Props> = ({
  teamId,
  initialAssetUrl,
  isOpen,
  toggleAssetModal,
  onSelect,
  fileType = "image",
}) => {
  return (
    <MoleculeAssetModal
      teamId={teamId}
      initialAssetUrl={initialAssetUrl}
      fileType={fileType}
      isOpen={isOpen}
      toggleAssetModal={toggleAssetModal}
      onSelect={onSelect}
      assetContainer={AssetContainer}
    />
  );
};

export default AssetModal;
