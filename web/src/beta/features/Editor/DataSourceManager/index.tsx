import React from "react";

import Modal from "@reearth/beta/components/Modal";

import { LayerAddProps } from "../useLayers";

import Asset from "./Asset";
import DelimitedText from "./DelimitedText";
import ThreeDTiles from "./ThreeDTiles";
import VectorTiles from "./VectorTiles";
import WmsTiles from "./WmsTiles";

export type DataProps = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

export type SourceType = "url" | "local" | "value";

export type FileFormatType = "CSV" | "GeoJSON" | "KML" | "CZML";

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
          label: "Common",
        },
        {
          content: <DelimitedText sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "delimitedText",
          label: "Delimited Text",
        },
        {
          content: <WmsTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "wms",
          label: "WMS",
        },
        {
          content: <VectorTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "vectorTiles",
          label: "Vector Tile",
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
