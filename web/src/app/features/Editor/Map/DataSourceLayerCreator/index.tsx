import { Modal, ModalPanel, TabItem, Tabs } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

import { LayerAddProps } from "../../hooks/useLayers";

import CSV from "./CSV";
import CZML from "./CZML";
import GeoJSON from "./GeoJSON";
import KML from "./KML";
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
  value: SourceType;
  children?: ReactNode;
}[];

const DataSourceLayerCreator: FC<DataProps> = ({
  sceneId,
  onClose,
  onSubmit
}) => {
  const t = useT();

  const tabsItem: TabItem[] = [
    {
      id: "geojson",
      name: "GeoJSON",
      children: (
        <GeoJSON sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />
      )
    },
    {
      id: "csv",
      name: "CSV",
      children: <CSV sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />
    },
    {
      id: "wms",
      name: "WMS",
      children: (
        <WmsTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />
      )
    },
    {
      id: "vectorTiles",
      name: t("Vector Tile"),
      children: (
        <VectorTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />
      )
    },
    {
      id: "threeDTiles",
      name: t("3D Tiles"),
      children: (
        <ThreeDTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />
      )
    },
    {
      id: "czml",
      name: "CZML",
      children: <CZML sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />
    },
    {
      id: "kml",
      name: "KML",
      children: <KML sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />
    }
  ];

  return (
    <Modal size="medium" visible={true} data-testid="datasource-modal">
      <ModalPanel
        title={t("Data Source Manager")}
        onCancel={onClose}
        data-testid="datasource-modal-panel"
      >
        <Wrapper data-testid="datasource-wrapper">
          <Tabs
            tabs={tabsItem}
            position="left"
            tabStyle="separated"
            data-testid="datasource-tabs"
          />
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};
const Wrapper = styled("div")(() => ({
  height: "440px"
}));

export default DataSourceLayerCreator;
