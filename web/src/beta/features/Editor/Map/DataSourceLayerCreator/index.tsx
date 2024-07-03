import { FC } from "react";

import { Modal, ModalPanel, TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";

import { LayerAddProps } from "../../hooks/useLayers";

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

const DataSourceLayerCreator: FC<DataProps> = ({ sceneId, onClose, onSubmit }) => {
  const t = useT();

  const tabsItem: TabItem[] = [
    {
      id: "asset",
      name: t("Common"),
      children: <Asset sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
    },
    {
      id: "delimitedText",
      name: t("CSV"),
      children: <DelimitedText sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
    },
    {
      id: "wms",
      name: t("WMS"),
      children: <WmsTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
    },
    {
      id: "vectorTiles",
      name: t("Vector Tile"),
      children: <VectorTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
    },
    {
      id: "threeDTiles",
      name: t("3D Tiles"),
      children: <ThreeDTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
    },
  ];

  return (
    <Modal size="medium" visible={true}>
      <ModalPanel title={t("Data Source Manager")} onCancel={onClose}>
        <Tabs tabs={tabsItem} position="left" tabStyle="separated" />
      </ModalPanel>
    </Modal>
  );
};

export default DataSourceLayerCreator;
