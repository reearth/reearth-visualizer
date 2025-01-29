import { Button, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import {
  ChangeCustomPropertyTitleInput,
  RemoveCustomPropertyInput,
  UpdateCustomPropertySchemaInput
} from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import SketchCustomProperties from "../shared/SketchCustomProperties";
import {
  CustomPropertyProp,
  PropertyListProp
} from "../SketchLayerCreator/type";

import ConfirmModal from "./ConfirmModal";
import useHooks from "./hooks";

export type SourceType = "url" | "local" | "value";

export type SketchLayerEditorProp = {
  layers: NLSLayer[];
  layerId?: string;
  isSketchLayerEditor?: boolean,
  onClose?: () => void;
  onCustomPropertySchemaUpdate?: (inp: UpdateCustomPropertySchemaInput) => void;
  onChangeCustomPropertyTitle?: (inp: ChangeCustomPropertyTitleInput) => void;
  onRemoveCustomProperty?: (inp: RemoveCustomPropertyInput) => void;
};

const SketchLayerEditor: FC<SketchLayerEditorProp> = ({
  layers,
  layerId,
  isSketchLayerEditor,
  onClose,
  onCustomPropertySchemaUpdate,
  onChangeCustomPropertyTitle,
  onRemoveCustomProperty
}) => {
  const t = useT();
  const [customProperties, setCustomProperties] = useState<
    CustomPropertyProp[]
  >([]);
  const [propertiesList, setPropertiesList] = useState<PropertyListProp[]>([]);
  const [warning, setWarning] = useState(false);

  const {
    confirmationModal,
    handleClose,
    handleSubmit,
    handleApply,
    setNewTitle,
    setPreviousTitle,
  } = useHooks({
    layers,
    layerId,
    customProperties,
    setPropertiesList,
    onClose,
    onCustomPropertySchemaUpdate,
    onChangeCustomPropertyTitle,
    onRemoveCustomProperty
  });

  return (
    <Modal size="medium" visible={true}>
      <ModalPanel
        title={t("Custom properties Schema Setting")}
        onCancel={handleClose}
        actions={
          <>
            <Button onClick={handleClose} size="normal" title={t("Cancel")} />
            <Button
              size="normal"
              title={t("Apply")}
              appearance="primary"
              onClick={handleApply}
              disabled={warning}
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
            warning={warning}
            setWarning={setWarning}
            setNewTitle={setNewTitle}
            setPreviousTitle={setPreviousTitle}
            isSketchLayerEditor={isSketchLayerEditor}
          />
        </Wrapper>
        <ConfirmModal
          visible={confirmationModal}
          onClose={handleApply}
          onSubmit={handleSubmit}
        />
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  height: "400px",
  background: theme.bg[0],
  padding: theme.spacing.normal
}));

export default SketchLayerEditor;
