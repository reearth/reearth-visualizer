import { useCallback, useEffect, useRef } from "react";

import { AssetField, InputField, NumberField, SwitchField } from "@reearth/beta/ui/fields";
import TextAreaField from "@reearth/beta/ui/fields/TextareaField";
import { SketchFeature } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";

import { FieldProp, ValueProp } from ".";

type Props = {
  field: any;
  selectedFeature?: SketchFeature;
  setField?: (v: FieldProp[] | ((prevFields: FieldProp[]) => FieldProp[])) => void;
  onSubmit?: (inp: any) => void;
};

export const FieldComponent = ({ field, selectedFeature, setField, onSubmit }: Props) => {
  const t = useT();

  const currentSelectedFeature = useRef(selectedFeature);

  useEffect(() => {
    currentSelectedFeature.current = selectedFeature;
  }, [selectedFeature]);

  const handleChange = useCallback(
    (value: ValueProp) => {
      setField?.(prevFields => {
        if (!prevFields) return [];
        return prevFields.map(prevField => {
          if (prevField.id === field.id) {
            return { ...prevField, value };
          }
          return prevField;
        });
      });

      const updatedProperties = {
        ...currentSelectedFeature.current?.properties,
        [field.title]: value,
      };
      if (Object.keys(updatedProperties).length) {
        onSubmit?.(updatedProperties);
      }
    },
    [field.id, field.title, setField, onSubmit],
  );

  const getDynamicValue = useCallback(
    (selectedFeature: SketchFeature | undefined, fieldTitle: string, fieldValue: any) => {
      return selectedFeature?.properties && fieldTitle in selectedFeature.properties
        ? selectedFeature.properties[fieldTitle]
        : fieldValue;
    },
    [],
  );
  return field?.type === "Text" ? (
    <InputField
      key={field?.id}
      commonTitle={field?.title}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onBlur={handleChange}
    />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      key={field?.id}
      commonTitle={field?.title}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onBlur={handleChange}
    />
  ) : field?.type === "Asset" ? (
    <AssetField
      key={field?.id}
      commonTitle={field?.title}
      entityType="image"
      fileType={"asset"}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : field?.type === "URL" ? (
    <AssetField
      key={field?.id}
      commonTitle={field?.title}
      entityType="file"
      fileType={"URL"}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      key={field?.id}
      commonTitle={field?.title}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onBlur={handleChange}
    />
  ) : field?.type === "Boolean" ? (
    <SwitchField
      key={field?.id}
      commonTitle={field?.title}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : (
    <div>{t("Unsupported custom field")}</div>
  );
};
