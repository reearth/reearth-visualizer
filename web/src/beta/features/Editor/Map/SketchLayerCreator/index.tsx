import {
  Button,
  Modal,
  ModalPanel,
  TextInput
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { InputGroup, InputsWrapper } from "../shared/SharedComponent";

import SketchCustomProperties from "./SketchCustomProperties";
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
  onClose,
  onSubmit
}) => {
  const t = useT();
  const [customProperties, setCustomProperties] = useState<
    CustomPropertyProp[]
  >([]);
  const [propertiesList, setPropertiesList] = useState<PropertyListProp[]>([]);
  const [layerName, setLayerName] = useState("");
  const [warning, setWarning] = useState(false);

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
        data: {
          type: "geojson"
        }
      }
    });
    onClose?.();
  };

  return (
    <Modal
      size="medium"
      visible={true}
      data-testid="sketch-layer-creator-modal-root"
    >
      <ModalPanel
        data-testid="sketch-layer-creator-modal"
        title={t("New Sketch Layer")}
        onCancel={onClose}
        actions={
          <>
            <Button
              onClick={onClose}
              size="normal"
              title={t("Cancel")}
              data-testid="sketch-layer-creator-cancel-btn"
            />
            <Button
              size="normal"
              title={t("Create")}
              appearance="primary"
              onClick={handleSubmit}
              disabled={!layerName || warning}
              data-testid="sketch-layer-creator-create-btn"
            />
          </>
        }
      >
        <Wrapper data-testid="sketch-layer-creator-wrapper">
          <InputGroup label={t("Layer Name")}>
            <InputsWrapper data-testid="sketch-layer-creator-name-input">
              <TextInput
                placeholder={t(" Text")}
                value={layerName}
                onChange={handleLayerNameChange}
              />
            </InputsWrapper>
          </InputGroup>
          <SketchCustomProperties
            customProperties={customProperties}
            propertiesList={propertiesList}
            warning={warning}
            setWarning={setWarning}
            setCustomProperties={setCustomProperties}
            setPropertiesList={setPropertiesList}
            data-testid="sketch-layer-creator-custom-properties"
          />
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  height: "440px",
  padding: theme.spacing.normal,
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal
}));

export default SketchLayerCreator;
