import { Button, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { UpdateCustomPropertySchemaInput } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import SketchCustomProperties from "../shared/SketchCustomProperties";
import {
  CustomPropertyProp,
  PropertyListProp,
} from "../SketchLayerCreator/type";

import useHooks from "./hooks";

export type SourceType = "url" | "local" | "value";

export type SketchLayerEditorProp = {
  layers: NLSLayer[];
  layerId?: string;
  onClose?: () => void;
  onCustomPropertySchemaUpdate?: (inp: UpdateCustomPropertySchemaInput) => void;
};

const SketchLayerEditor: FC<SketchLayerEditorProp> = ({
  layers,
  layerId,
  onClose,
  onCustomPropertySchemaUpdate,
}) => {
  const t = useT();
  const [customProperties, setCustomProperties] = useState<
    CustomPropertyProp[]
  >([]);
  const [propertiesList, setPropertiesList] = useState<PropertyListProp[]>([]);
  const { handleClose, handleSubmit } = useHooks({
    layers,
    layerId,
    customProperties,
    setPropertiesList,
    onClose,
    onCustomPropertySchemaUpdate,
  });

  return (
    <Modal size="medium" visible={true}>
      <ModalPanel
        title={t("Custom properties Schema Setting")}
        onCancel={handleClose}
        actions={
          <>
            <Button onClick={handleClose} size="normal" title="Cancel" />
            <Button
              size="normal"
              title="Apply"
              appearance="primary"
              onClick={handleSubmit}
            />
          </>
        }
      >
        <Wrapper>
          <SketchCustomProperties
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

export default SketchLayerEditor;
