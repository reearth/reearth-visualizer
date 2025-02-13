import {
  InputGroup,
  InputsWrapper
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  PopupMenu,
  PopupMenuItem,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback, useEffect, useMemo, useState } from "react";

import { CustomPropertyProp } from "../../../../SketchLayerCreator/type";

type CustomPropertyFieldProps = {
  isEditField?: boolean;
  selectedField?: {
    key: string;
    value: string;
  } | null;
  schemaJSON: Record<string, string>;
  onBlur?: (title: string) => void;
  onClose: () => void;
  onCustomPropertySchemaUpdate?: (schema: CustomPropertyProp) => void;
  onOpenConfirmModal?: () => void;
  onSchemaJSONUpdate: Dispatch<SetStateAction<Record<string, string>>>;
};

const dataTypes = [
  {
    id: "text",
    title: "Text"
  },
  {
    id: "textArea",
    title: "TextArea"
  },
  {
    id: "url",
    title: "URL"
  },
  {
    id: "asset",
    title: "Asset"
  },
  {
    id: "float",
    title: "Float"
  },
  {
    id: "int",
    title: "Int"
  },
  {
    id: "bool",
    title: "Boolean"
  }
];

const dataTypeGroups = {
  string: ["Text", "TextArea", "URL", "Asset"],
  number: ["Float", "Int"],
  boolean: ["Boolean"]
};

const CustomPropertyFieldModal: FC<CustomPropertyFieldProps> = ({
  selectedField,
  isEditField,
  schemaJSON,
  onBlur,
  onClose,
  onCustomPropertySchemaUpdate,
  onOpenConfirmModal,
  onSchemaJSONUpdate
}) => {
  const t = useT();
  const theme = useTheme();

  const [customPropertyTitle, setCustomPropertyTitle] = useState(
    selectedField?.key
  );
  const [dataType, setDataType] = useState(selectedField?.value || "");

  const menuItems: PopupMenuItem[] = useMemo(() => {
    const currentGroup = Object.keys(dataTypeGroups).find((group) =>
      dataTypeGroups[group as keyof typeof dataTypeGroups].includes(dataType)
    );

    return dataTypes.map((dataTypeItem) => {
      const isDisabled = !!(
        isEditField &&
        currentGroup &&
        !dataTypeGroups[currentGroup as keyof typeof dataTypeGroups].includes(
          dataTypeItem.title
        )
      );

      return {
        id: dataTypeItem.id,
        title: dataTypeItem.title,
        disabled: isDisabled,
        onClick: isDisabled ? undefined : () => setDataType(dataTypeItem.title)
      };
    });
  }, [dataType, isEditField]);

  useEffect(() => {
    if (!selectedField?.value || !schemaJSON) return;

    setTimeout(() => {
      onSchemaJSONUpdate((prevSchema) => {
        const existingValue = prevSchema[selectedField.key] || "";
        const match = existingValue.match(/_(\w+)$/);
        const suffix = match ? match[0] : "";

        const newValue = `${dataType}${suffix}`;

        if (existingValue === newValue) {
          return prevSchema;
        }
        return { ...prevSchema, [selectedField.key]: `${dataType}${suffix}` };
      });
    }, 0); // Delay update to avoid immediate loop
  }, [
    selectedField?.value,
    selectedField?.key,
    dataType,
    schemaJSON,
    onSchemaJSONUpdate
  ]);

const disabled = useMemo(() => {
  const checkExistValue = dataType !== selectedField?.value;

  return (
    !customPropertyTitle ||
    !dataType ||
    (!isEditField &&
      Object.prototype.hasOwnProperty.call(schemaJSON, customPropertyTitle)) ||
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
      const updatedSchema = { ...prevSchema };
      updatedSchema[customPropertyTitle] =
        `${dataType}_${Object.keys(updatedSchema).length + 1}`;
      onCustomPropertySchemaUpdate?.(updatedSchema);

      return updatedSchema;
    });

    onClose?.();
  }, [
    onSchemaJSONUpdate,
    onCustomPropertySchemaUpdate,
    onClose,
    customPropertyTitle,
    dataType
  ]);

  return (
    <Modal size="small" visible={true}>
      <ModalPanel
        title={
          isEditField ? t("Edit Custom Property") : t("New Custom Property")
        }
        onCancel={onClose}
        actions={
          <>
            <Button onClick={onClose} size="normal" title={t("Cancel")} />
            <Button
              onClick={isEditField ? onOpenConfirmModal : handleSubmit}
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
                onChange={setCustomPropertyTitle}
                onBlur={onBlur}
              />
            </InputsWrapper>
          </InputGroup>

          <InputGroup label={t("Property Type")}>
            <PopupMenu
              extendTriggerWidth
              extendContentWidth
              menu={menuItems}
              iconColor={theme.content.main}
              label={
                <LabelInput>
                  <Typography size="body" color={theme.content.main}>
                    {dataType}
                  </Typography>
                  <Icon icon="caretDown" />
                </LabelInput>
              }
            />
          </InputGroup>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal
}));

const LabelInput = styled("div")(({ theme }) => ({
  boxSizing: "border-box",
  backgroundColor: `${theme.bg[1]}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: `${theme.spacing.small}px`,
  borderRadius: `${theme.radius.small}px`,
  border: `1px solid  ${theme.outline.weak}`,
  boxShadow: `${theme.shadow.input}`,
  width: "100%",
  height: "28px",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`
}));

export default CustomPropertyFieldModal;
