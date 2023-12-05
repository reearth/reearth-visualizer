import React from "react";

import Modal from "@reearth/beta/components/Modal";
import { useT } from "@reearth/services/i18n";

import { LayerAddProps } from "../useLayers";

import Asset from "./Common";
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

export type DataSourceOptType = {
  label: string;
  keyValue: SourceType;
}[];

const DataSourceManager: React.FC<DataProps> = ({ sceneId, onClose, onSubmit }) => {
  const t = useT();
  return (
    <Modal
      size="md"
      isVisible={true}
      title={t("Data Source Manager")}
      onClose={onClose}
      sidebarTabs={[
        {
          content: <Asset sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "asset",
          label: t("Common"),
        },
        {
          content: <DelimitedText sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "delimitedText",
          label: t("CSV"),
        },
        {
          content: <WmsTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "wms",
          label: t("WMS"),
        },
        {
          content: <VectorTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "vectorTiles",
          label: t("Vector Tile"),
        },
        {
          content: <ThreeDTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "threeDTiles",
          label: t("3D Tiles"),
        },
      ]}
    />
  );
};

export default DataSourceManager;
