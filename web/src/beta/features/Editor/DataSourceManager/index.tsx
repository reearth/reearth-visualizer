import React from "react";

import Modal from "@reearth/beta/components/Modal";

import { LayerAddProps } from "../useLayers";

import Asset from "./Asset";
import DelimitedText from "./DelimitedText";
import useHooks from "./hooks";
import ThreeDTiles from "./ThreeDTiles";
import VectorTiles from "./VectorTiles";
import WmsTiles from "./WmsTiles";

export type DataProps = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

const DataSourceManager: React.FC<DataProps> = ({ sceneId, onClose, onSubmit }) => {
  const {
    urlValue,
    layerValue,
    layerInput,
    layers,
    setUrlValue,
    setLayerValue,
    handleAddLayer,
    handleDeleteLayer,
    handleLayerInput,
  } = useHooks();

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
        {
          content: (
            <WmsTiles
              urlValue={urlValue}
              layerValue={layerValue}
              layerInput={layerInput}
              layers={layers}
              setUrlValue={setUrlValue}
              setLayerValue={setLayerValue}
              handleAddLayer={handleAddLayer}
              handleDeleteLayer={handleDeleteLayer}
              handleLayerInput={handleLayerInput}
              sceneId={sceneId}
              onSubmit={onSubmit}
              onClose={onClose}
            />
          ),
          id: "wms",
          label: "WMS",
        },
        {
          content: (
            <VectorTiles
              urlValue={urlValue}
              layerValue={layerValue}
              layerInput={layerInput}
              layers={layers}
              setUrlValue={setUrlValue}
              setLayerValue={setLayerValue}
              handleAddLayer={handleAddLayer}
              handleDeleteLayer={handleDeleteLayer}
              handleLayerInput={handleLayerInput}
              sceneId={sceneId}
              onSubmit={onSubmit}
              onClose={onClose}
            />
          ),
          id: "vectorTiles",
          label: "Vector Tile",
        },
      ]}
    />
  );
};

export default DataSourceManager;
