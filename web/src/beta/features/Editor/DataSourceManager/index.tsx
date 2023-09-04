import React from "react";

import Modal from "@reearth/beta/components/Modal";

import { LayerAddProps } from "../useLayers";

import Asset from "./asset";
import DelimitedText from "./delimitedText";
import ThreeDTiles from "./threeDtiles";

export type DataProps = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

const DataSourceManager: React.FC<DataProps> = ({ sceneId, onClose, onSubmit }) => {
  return (
    <Modal
      size="md"
      isVisible={true}
      title="Data Source Manager"
      onClose={onClose}
      sidebarTabs={[
        {
          content: <Asset sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "asset",
          label: "Asset",
        },
        {
          content: <DelimitedText sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "delimitedText",
          label: "Delimited Text",
        },
        {
          content: <ThreeDTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "threeDTiles",
          label: "3D Tiles",
        },
      ]}
    />
  );
};

export default DataSourceManager;
