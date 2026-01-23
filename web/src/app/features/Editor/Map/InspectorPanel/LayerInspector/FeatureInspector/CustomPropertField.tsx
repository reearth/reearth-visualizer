import { ALL_TYPES } from "@reearth/app/features/AssetsManager/constants";
import {
  AssetField,
  InputField,
  NumberField,
  SwitchField
} from "@reearth/app/ui/fields";
import TextAreaField from "@reearth/app/ui/fields/TextareaField";
import { useT } from "@reearth/services/i18n/hooks";
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

  const appearance = useMemo(() => {
    return !editMode ? "readonly" : undefined;
  }, [editMode]);

  return field?.type === "Text" ? (
    <InputField
      key={field?.id}
      title={field?.title}
      value={field.value as string}
      onChangeComplete={handleChange}
      disabled={!editMode}
      appearance={appearance}
    />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      key={field?.id}
      title={field?.title}
      value={field.value as string}
      resizable="height"
      onChangeComplete={handleChange}
      disabled={!editMode}
      appearance={appearance}
    />
  ) : field?.type === "Asset" ? (
    <AssetField
      key={field?.id}
      title={field?.title}
      assetsTypes={ALL_TYPES}
      inputMethod={"asset"}
      value={field.value as string}
      disabled={!editMode}
      appearance={appearance}
      onChange={handleChange}
    />
  ) : field?.type === "URL" ? (
    <InputField
      key={field?.id}
      title={field?.title}
      value={field.value as string}
      onChange={handleChange}
      disabled={!editMode}
      appearance={appearance}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      key={field?.id}
      title={field?.title}
      value={field.value as number}
      onChangeComplete={handleChange}
      disabled={!editMode}
      appearance={appearance}
    />
  ) : field?.type === "Boolean" ? (
    <SwitchField
      key={field?.id}
      title={field?.title}
      value={field.value as boolean}
      onChange={handleChange}
      disabled={!editMode}
    />
  ) : (
    <div>{t("Unsupported custom field")}</div>
  );
};
