import { useCallback, useEffect, useRef } from "react";

import NumberField from "@reearth/beta/components/fields/NumberField";
import TextAreaField from "@reearth/beta/components/fields/TextAreaField";
import TextField from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import URLField from "@reearth/beta/components/fields/URLField";
import { Feature } from "@reearth/beta/lib/core/engines";
import { useT } from "@reearth/services/i18n";

import { FieldProp, ValueProp } from "./FeatureData";

type Props = {
  field: any;
  selectedFeature?: Feature;
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
    (selectedFeature: Feature | undefined, fieldTitle: string, fieldValue: any) => {
      return selectedFeature?.properties && fieldTitle in selectedFeature.properties
        ? selectedFeature.properties[fieldTitle]
        : fieldValue;
    },
    [],
  );
  return field?.type === "Text" ? (
    <TextField
      key={field?.id}
      name={field?.title}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      key={field?.id}
      name={field?.title}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : field?.type === "Asset" ? (
    <URLField
      key={field?.id}
      name={field?.title}
      entityType="image"
      fileType={"asset"}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : field?.type === "URL" ? (
    <URLField
      key={field?.id}
      name={field?.title}
      entityType="file"
      fileType={"URL"}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      key={field?.id}
      name={field?.title}
      value={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : field?.type === "Boolean" ? (
    <ToggleField
      key={field?.id}
      name={field?.title}
      checked={getDynamicValue(selectedFeature, field.title, field.value)}
      onChange={handleChange}
    />
  ) : (
    <div>{t("Unsupported custom field")}</div>
  );
};
