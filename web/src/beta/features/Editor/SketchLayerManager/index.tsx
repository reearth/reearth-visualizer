import React, { useCallback, useMemo, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Modal from "@reearth/beta/components/Modal";
import TabMenu from "@reearth/beta/components/TabMenu";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";

import { LayerAddProps } from "../useLayers";

import CustomedProperties from "./CustomedProperties";
import General from "./General";
import { SketchLayerDataType } from "./types";

export type Property = {
  [key: string]: string;
};

export interface SketchProps {
  sceneId?: string;
  layerStyles?: LayerStyle[];
  customPropertyList?: Property[];
  layerName?: string;
  layerStyle?: string;
  setLayerName?: (value: string) => void;
  setLayerStyle?: (value: string) => void;
  onClose?: () => void;
  onSubmit?: (layerAddInp: LayerAddProps) => void;
  setCustomPropertyList?: (prev: Property[]) => void;
}

interface TabObject {
  id: string;
  name?: string;
  component?: JSX.Element;
}

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
  const [customPropertyList, setCustomPropertyList] = useState<Property[]>([]);
  const [layerName, setLayerName] = useState("");
  const [layerStyle, setLayerStyle] = useState("");

  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
  }, []);

  const handleSubmit = () => {
    const schemaJSON = customPropertyList.reduce((acc, property, index) => {
      const [key] = Object.keys(property);

      // Appending index + 1 to the value for sorting later
      const value = `${property[key]}_${index + 1}`;
      acc[key] = value;
      return acc;
    }, {});

    onSubmit?.({
      layerType: "simple",
      sceneId: sceneId || "",
      title: layerName,
      visible: true,
      schema: schemaJSON,
      config: {
        properties: {
          name: layerName,
          layerStyle: layerStyle,
        },
        data: {
          type: "geojson",
        },
      },
    });
    onClose?.();
  };

  const tabs: TabObject[] = useMemo(
    () => [
      {
        id: "general",
        name: t("General"),
        component: (
          <General
            layerStyles={layerStyles}
            layerName={layerName}
            layerStyle={layerStyle}
            setLayerName={setLayerName}
            setLayerStyle={setLayerStyle}
          />
        ),
      },
      {
        id: "customProperties",
        name: t("Custom Properties"),
        component: (
          <CustomedProperties
            customPropertyList={customPropertyList}
            setCustomPropertyList={setCustomPropertyList}
          />
        ),
      },
    ],
    [customPropertyList, layerName, layerStyle, layerStyles, t],
  );

  return (
    <Modal
      size="md"
      isVisible={true}
      title={t("New Sketch Layer")}
      onClose={onClose}
      button1={<Button text={t("Cancel")} onClick={onClose} />}
      button2={
        <Button
          text={t("Create")}
          buttonType="primary"
          size="medium"
          disabled={!layerName}
          onClick={handleSubmit}
        />
      }
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
