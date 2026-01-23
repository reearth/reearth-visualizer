import {
  InputGroup,
  InputsWrapper
} from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import {
  Button,
  Modal,
  ModalPanel,
  Selector,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import ConfirmModal from "@reearth/app/ui/components/ConfirmModal";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { dataTypes } from "../../../../SketchLayerCreator";
import { CustomPropertyProp } from "../../../../SketchLayerCreator/type";

type CustomPropertyFieldProps = {
  isEditField?: boolean;
  selectedField?: {
    key: string;
    value: string;
  } | null;
  schemaJSON: Record<string, string>;
  showEditFieldConfirmModal?: boolean;
  onSubmit?: (schema: CustomPropertyProp, newTitle?: string) => void;
  onClose?: () => void;
  onSchemaJSONUpdate?: Dispatch<SetStateAction<Record<string, string>>>;
};

const dataTypeGroups = {
  string: ["Text", "TextArea", "URL", "Asset"],
  number: ["Float", "Int"],
  boolean: ["Boolean"]
};

const CustomPropertyFieldModal: FC<CustomPropertyFieldProps> = ({
  selectedField,
  isEditField,
  schemaJSON,
  onClose,
  onSubmit,
  onSchemaJSONUpdate
}) => {
  const t = useT();
  const [customPropertyTitle, setCustomPropertyTitle] = useState(
    selectedField?.key
  );

  const [dataType, setDataType] = useState(selectedField?.value || "");

  const [showEditFieldConfirmModal, setShowEditFieldConfirmModal] =
    useState(false);

  const openEditFieldConfirmModal = useCallback(() => {
    setShowEditFieldConfirmModal(true);
  }, []);

  const closeEditFieldConfirmModal = useCallback(() => {
    setShowEditFieldConfirmModal(false);
  }, []);

  useEffect(() => {
    if (selectedField) {
      setCustomPropertyTitle(selectedField.key);
      setDataType(selectedField.value);
    } else {
      setCustomPropertyTitle("");
      setDataType("");
    }
  }, [selectedField]);

  const groupedDataTypes = useMemo(() => {
    if (!isEditField || !selectedField?.value) return dataTypes;

    const groupKey = Object.keys(dataTypeGroups).find((key) =>
      dataTypeGroups[key as keyof typeof dataTypeGroups].includes(
        selectedField.value
      )
    );

    return groupKey
      ? dataTypeGroups[groupKey as keyof typeof dataTypeGroups]
      : dataTypes;
  }, [isEditField, selectedField?.value]);

  const disabled = useMemo(() => {
    const checkExistValue = dataType !== selectedField?.value;

    return (
      !customPropertyTitle ||
      !dataType ||
      (!isEditField &&
        Object.prototype.hasOwnProperty.call(
          schemaJSON,
          customPropertyTitle
        )) ||
      (!checkExistValue &&
        Object.prototype.hasOwnProperty.call(schemaJSON, customPropertyTitle))
    );
  }, [
    customPropertyTitle,
    dataType,
    schemaJSON,
    selectedField?.value,
    isEditField
  ]);

  const handleSubmit = useCallback(() => {
    if (!customPropertyTitle) return;

    onSchemaJSONUpdate?.((prevSchema = {}) => {
      let updatedSchema = { ...prevSchema };

      if (selectedField) {
        const { [selectedField.key]: _, ...restSchema } = prevSchema;
        updatedSchema = restSchema;
        const isDataTypeChanged =
          selectedField.key !== customPropertyTitle &&
          selectedField.value === dataType;

        const existingValue = prevSchema[selectedField.key];
        const match = existingValue?.match(/_(\w+)$/);
        const suffix = match
          ? match[0]
          : `${dataType}_${Object.keys(updatedSchema).length + 1}`;
        updatedSchema[customPropertyTitle] = isDataTypeChanged
          ? existingValue
          : `${dataType}${suffix}`;

        if (isDataTypeChanged) {
          onSubmit?.(updatedSchema, customPropertyTitle);
        } else {
          onSubmit?.(updatedSchema);
        }
        closeEditFieldConfirmModal();
      } else {
        updatedSchema[customPropertyTitle] =
          `${dataType}_${Object.keys(updatedSchema).length + 1}`;
        onSubmit?.(updatedSchema);
      }
      onClose?.();
      return updatedSchema;
    });
  }, [
    customPropertyTitle,
    onSchemaJSONUpdate,
    onClose,
    selectedField,
    dataType,
    onSubmit,
    closeEditFieldConfirmModal
  ]);

  return (
    <>
      <Modal size="small" visible>
        <ModalPanel
          title={
            isEditField ? t("Edit Custom Property") : t("New Custom Property")
          }
          onCancel={onClose}
          actions={
            <>
              <Button onClick={onClose} size="normal" title={t("Cancel")} />
              <Button
                onClick={isEditField ? openEditFieldConfirmModal : handleSubmit}
                size="normal"
                title={isEditField ? t("Submit") : t("Apply")}
                appearance="primary"
                disabled={disabled}
              />
            </>
          }
        >
          <Wrapper>
            <InputGroup label={t("Property Title")}>
              <InputsWrapper>
                <TextInput
                  value={customPropertyTitle}
                  onBlur={setCustomPropertyTitle}
                />
              </InputsWrapper>
            </InputGroup>

            <InputGroup label={t("Property Type")}>
              <Selector
                value={dataType}
                placeholder={t("Please select one type")}
                options={groupedDataTypes.map((v) => ({
                  value: v,
                  label: v
                }))}
                onChange={(value: string | string[]) =>
                  setDataType(value as string)
                }
              />
            </InputGroup>
          </Wrapper>
        </ModalPanel>
      </Modal>
      {showEditFieldConfirmModal && (
        <ConfirmModal
          visible={true}
          title={t("Apply Current Edits?")}
          description={t(
            "This save will apply to all features in the current layer. Do you want to proceed?"
          )}
          actions={
            <>
              <Button
                size="normal"
                title={t("Cancel")}
                onClick={closeEditFieldConfirmModal}
              />
              <Button
                size="normal"
                title={t("Apply")}
                appearance="primary"
                onClick={handleSubmit}
              />
            </>
          }
        />
      )}
    </>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal
}));

export default CustomPropertyFieldModal;
