import {
  Button,
  Modal,
  ModalPanel,
  TabItem,
  Tabs
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import SketchCustomProperties from "../shared/SketchCustomProperties";

import General from "./General";
import {
  CustomPropertyProp,
  PropertyListProp,
  SketchLayerProps,
  SketchLayerDataType
} from "./type";

export const dataTypes: SketchLayerDataType[] = [
  "Text",
  "TextArea",
  "URL",
  "Asset",
  "Float",
  "Int",
  "Boolean"
];

const SketchLayerCreator: FC<SketchLayerProps> = ({
  sceneId,
  layerStyles,
  onClose,
  onSubmit
}) => {
  const t = useT();
  const [customProperties, setCustomProperties] = useState<
    CustomPropertyProp[]
  >([]);
  const [propertiesList, setPropertiesList] = useState<PropertyListProp[]>([]);
  const [layerName, setLayerName] = useState("");
  const [layerStyle, setLayerStyle] = useState("");
  const [warning, setWarning] = useState(false);

  const handleLayerStyleChange = useCallback((value?: string | string[]) => {
    setLayerStyle(value as string);
  }, []);

  const handleLayerNameChange = useCallback((value?: string) => {
    setLayerName(value || "");
  }, []);

  const handleSubmit = () => {
    const schemaJSON = customProperties.reduce((acc, property, index) => {
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
          name: layerName
        },
        layerStyleId: layerStyle,
        data: {
          type: "geojson"
        }
      }
    });
    onClose?.();
  };

  const tabsItem: TabItem[] = [
    {
      id: "general",
      name: t("General"),
      children: (
        <General
          layerStyles={layerStyles}
          layerName={layerName}
          layerStyle={layerStyle}
          onLayerStyleChange={handleLayerStyleChange}
          onLayerNameChange={handleLayerNameChange}
        />
      )
    },
    {
      id: "customProperties",
      name: t("Custom Properties"),
      children: (
        <SketchCustomProperties
          customProperties={customProperties}
          propertiesList={propertiesList}
          warning={warning}
          setWarning={setWarning}
          setCustomProperties={setCustomProperties}
          setPropertiesList={setPropertiesList}
        />
      )
    }
  ];

  return (
    <Modal size="medium" visible={true}>
      <ModalPanel
        title={t("New Sketch Layer")}
        onCancel={onClose}
        actions={
          <>
            <Button onClick={onClose} size="normal" title="Cancel" />
            <Button
              size="normal"
              title="Create"
              appearance="primary"
              onClick={handleSubmit}
              disabled={!layerName || warning}
            />
          </>
        }
      >
        <Wrapper>
          <Tabs tabs={tabsItem} />
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  height: "440px",
  padding: theme.spacing.normal,
  background: theme.bg[0]
}));

export default SketchLayerCreator;
