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

export type Property = { [x: string]: string };

export type SketchProps = {
  sceneId?: string;
  layerStyles?: LayerStyle[];
  propertyList?: Property[];
  layerName?: string;
  layerStyle?: string;
  setLayerName?: (value: string) => void;
  setLayerStyle?: (value: string) => void;
  onClose?: () => void;
  onSubmit?: (layerAddInp: LayerAddProps) => void;
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
  const [layerName, setLayerName] = useState("");
  const [layerStyle, setLayerStyle] = useState("");

  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
  }, []);

  const handleSubmit = () => {
    onSubmit?.({
      layerType: "simple",
      sceneId: sceneId || "",
      title: layerName,
      visible: true,
      config: {
        properties: {
          name: layerName,
          layerStyle: layerStyle,
          customProperties: propertyList,
        },
        data: {
          type: "geojson",
          isSketchLayer: true,
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
        id: "customized Properties",
        name: t("Customized Properties"),
        component: (
          <CustomedProperties propertyList={propertyList} setPropertyList={setPropertyList} />
        ),
      },
    ],
    [layerName, layerStyle, layerStyles, propertyList, t],
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
