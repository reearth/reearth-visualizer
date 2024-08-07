import { FC, useCallback, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useMapPage } from "../../context";
import CustomedProperties from "../CustomedProperties";
import { CustomPropertyProps } from "../type";

export type SourceType = "url" | "local" | "value";

type CustomPropertyModalProp = {
  onClose?: () => void;
  onSubmit?: () => void;
};

const CustomPropertySchemaModal: FC<CustomPropertyModalProp & CustomPropertyProps> = ({
  propertiesList,
  customProperties,
  setCustomProperties,
  setPropertiesList,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const { layers, layerId } = useMapPage();

  const sketchLayers = useMemo(() => layers.filter(({ isSketch }) => isSketch), [layers]);

  useEffect(() => {
    if (setPropertiesList) {
      const layer = sketchLayers.find(layer => layer.id === layerId);
      if (layer) {
        const newPropertiesList = processCustomProperties(layer);
        setPropertiesList(newPropertiesList);
      }
    }
  }, [setPropertiesList, sketchLayers, layerId]);

  const handleClose = useCallback(() => {
    if (onClose) setPropertiesList?.([]);
    onClose?.();
  }, [onClose, setPropertiesList]);

  return (
    <Modal size="medium" visible={true}>
      <ModalPanel
        title={t("Custom properties Schema Setting")}
        onCancel={handleClose}
        actions={
          <>
            <Button onClick={handleClose} size="normal" title="Cancel" />
            <Button size="normal" title="Apply" appearance="primary" onClick={onSubmit} />
          </>
        }>
        <Wrapper>
          <CustomedProperties
            customProperties={customProperties}
            setCustomProperties={setCustomProperties}
            propertiesList={propertiesList}
            setPropertiesList={setPropertiesList}
          />
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  height: "400px",
  background: theme.bg[0],
  padding: theme.spacing.normal,
}));

export default CustomPropertySchemaModal;

const processCustomProperties = (layer: NLSLayer) => {
  const { customPropertySchema } = layer.sketch || {};
  if (!customPropertySchema) return [];

  const sortedEntries = Object.entries(customPropertySchema)
    .map(([key, value]) => ({
      key,
      value: (value as string).replace(/_\d+$/, ""),
      number: parseInt((value as string).match(/_(\d+)$/)?.[1] || "0", 10),
    }))
    .sort((a, b) => a.number - b.number);

  return sortedEntries.map(({ key, value }) => ({
    id: uuidv4(),
    key,
    value,
  }));
};
