import {
  FILE_TYPES,
  IMAGE_TYPES,
} from "@reearth/beta/features/AssetsManager/constants";
import {
  AssetField,
  InputField,
  NumberField,
  SwitchField,
} from "@reearth/beta/ui/fields";
import TextAreaField from "@reearth/beta/ui/fields/TextareaField";
import { useT } from "@reearth/services/i18n";
import { useCallback } from "react";

import { FieldProp, ValueProp } from ".";

type Props = {
  field: FieldProp;
  setFields?: (
    v: FieldProp[] | ((prevFields: FieldProp[]) => FieldProp[]),
  ) => void;
};

export const FieldComponent = ({ field, setFields }: Props) => {
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
    [field.id, setFields],
  );

  return field?.type === "Text" ? (
    <InputField
      key={field?.id}
      commonTitle={field?.title}
      value={field.value as string}
      onBlur={handleChange}
    />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      key={field?.id}
      commonTitle={field?.title}
      value={field.value as string}
      onBlur={handleChange}
    />
  ) : field?.type === "Asset" ? (
    <AssetField
      key={field?.id}
      commonTitle={field?.title}
      assetsTypes={IMAGE_TYPES}
      inputMethod={"asset"}
      value={field.value as string}
      onChange={handleChange}
    />
  ) : field?.type === "URL" ? (
    <AssetField
      key={field?.id}
      commonTitle={field?.title}
      assetsTypes={FILE_TYPES}
      inputMethod={"URL"}
      value={field.value as string}
      onChange={handleChange}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      key={field?.id}
      commonTitle={field?.title}
      value={field.value as number}
      onBlur={handleChange}
    />
  ) : field?.type === "Boolean" ? (
    <SwitchField
      key={field?.id}
      commonTitle={field?.title}
      value={field.value as boolean}
      onChange={handleChange}
    />
  ) : (
    <div>{t("Unsupported custom field")}</div>
  );
};
