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
  videoOnly,
  toggleAssetModal,
  onSelect,
}) => {
  return (
    <MoleculeAssetModal
      teamId={teamId}
      initialAssetUrl={initialAssetUrl}
      isOpen={isOpen}
      videoOnly={videoOnly}
      toggleAssetModal={toggleAssetModal}
      onSelect={onSelect}
      assetContainer={AssetContainer}
    />
  );
};

export default AssetModal;
