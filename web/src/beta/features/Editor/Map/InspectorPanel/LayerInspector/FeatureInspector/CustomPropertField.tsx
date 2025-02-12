import { ALL_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import {
  AssetField,
  InputField,
  NumberField,
  SwitchField
} from "@reearth/beta/ui/fields";
import TextAreaField from "@reearth/beta/ui/fields/TextareaField";
import { useT } from "@reearth/services/i18n";
import { useCallback, useMemo } from "react";

import { FieldProp, ValueProp } from ".";

type Props = {
  field: FieldProp;
  editMode: boolean;
  setFields?: (
    v: FieldProp[] | ((prevFields: FieldProp[]) => FieldProp[])
  ) => void;
};

export const FieldComponent = ({ field, editMode, setFields }: Props) => {
  const t = useT();

  const handleChange = useCallback(
    (value: ValueProp) => {
      setFields?.((prevFields) => {
        if (!prevFields) return [];
        return prevFields.map((prevField) => {
          if (prevField.id === field.id) {
            return { ...prevField, value };
          }
          return prevField;
        });
      });
    },
    [field.id, setFields]
  );

  const apperance = useMemo(() => {
    return editMode ? "readonly" : undefined;
  }, [editMode]);

  return field?.type === "Text" ? (
    <InputField
      key={field?.id}
      title={field?.title}
      value={field.value as string}
      onBlur={handleChange}
      disabled={editMode}
      appearance={apperance}
    />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      key={field?.id}
      title={field?.title}
      value={field.value as string}
      resizable="height"
      onBlur={handleChange}
      disabled={editMode}
      appearance={apperance}
    />
  ) : field?.type === "Asset" ? (
    <AssetField
      key={field?.id}
      title={field?.title}
      assetsTypes={ALL_TYPES}
      inputMethod={"asset"}
      value={field.value as string}
      disabled={editMode}
      appearance={apperance}
      onChange={handleChange}
    />
  ) : field?.type === "URL" ? (
    <InputField
      key={field?.id}
      title={field?.title}
      value={field.value as string}
      onChange={handleChange}
      disabled={editMode}
      appearance={apperance}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      key={field?.id}
      title={field?.title}
      value={field.value as number}
      onBlur={handleChange}
      disabled={editMode}
      appearance={apperance}
    />
  ) : field?.type === "Boolean" ? (
    <SwitchField
      key={field?.id}
      title={field?.title}
      value={field.value as boolean}
      onChange={handleChange}
      disabled={editMode}
    />
  ) : (
    <div>{t("Unsupported custom field")}</div>
  );
};
