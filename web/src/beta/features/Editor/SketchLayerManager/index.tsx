import React, { useCallback, useMemo, useState } from "react";

import Modal from "@reearth/beta/components/Modal";
import TabMenu from "@reearth/beta/components/TabMenu";
import { SketchLayerDataType } from "@reearth/beta/lib/core/mantle/types";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";

import { LayerAddProps } from "../useLayers";

import CustomedProperties from "./CustomedProperties";
import General from "./General";

export type Property = { [x: string]: string };

export type SketchProps = {
  sceneId: string;
  layerStyles?: LayerStyle[];
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
  propertyList?: Property[];
  setPropertyList?: (prev: Property[]) => void;
};

type TabObject = {
  id: string;
  name?: string | undefined;
  component?: JSX.Element | undefined;
};

export const dataTypes: SketchLayerDataType[] = [
  "Text",
  "TextArea",
  "URL",
  "Asset",
  "Float",
  "Int",
  "Boolean",
];

const SketchLayerManager: React.FC<SketchProps> = ({ sceneId, layerStyles, onClose, onSubmit }) => {
  const t = useT();
  const [selectedTab, setSelectedTab] = useState("general");
  const [propertyList, setPropertyList] = useState<{ [x: string]: string }[]>([]);

  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
  }, []);

  const tabs: TabObject[] = useMemo(
    () => [
      {
        id: "general",
        name: t("General"),
        component: (
          <General
            onClose={onClose}
            sceneId={sceneId}
            layerStyles={layerStyles}
            onSubmit={onSubmit}
          />
        ),
      },
      {
        id: "customized Properties",
        name: t("Customized Properties"),
        component: (
          <CustomedProperties
            propertyList={propertyList}
            setPropertyList={setPropertyList}
            onClose={onClose}
            sceneId={sceneId}
            onSubmit={onSubmit}
          />
        ),
      },
    ],
    [layerStyles, onClose, onSubmit, propertyList, sceneId, t],
  );

  return (
    <Modal
      size="md"
      isVisible={true}
      title={t("New Sketch Layer")}
      onClose={onClose}
      isContent={true}>
      <TabMenu
        menuAlignment="top"
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectedTabChange={handleTabChange}
      />
    </Modal>
  );
};

export default SketchLayerManager;
