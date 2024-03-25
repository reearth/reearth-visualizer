import { useCallback } from "react";

import NumberField from "@reearth/beta/components/fields/NumberField";
import TextAreaField from "@reearth/beta/components/fields/TextAreaField";
import TextField from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import URLField from "@reearth/beta/components/fields/URLField";
import { Geometry } from "@reearth/beta/lib/core/engines";
import { useT } from "@reearth/services/i18n";

import { FieldProp, ValueProp } from "./FeatureData";

type Props = {
  field: any;
  selectedFeature?: {
    id: string;
    geometry: Geometry | undefined;
    properties: any;
  };
  setField?: (v: FieldProp[] | ((prevFields: FieldProp[]) => FieldProp[])) => void;
  onSubmit?: (inp: any) => void;
};

export const FieldComponent = ({ field, selectedFeature, setField, onSubmit }: Props) => {
  const t = useT();

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
      let updatedProperty = {};

      switch (field.type) {
        case "Text":
          updatedProperty = { title: value };
          break;
        case "TextArea":
          updatedProperty = { content: value };
          break;
        case "Asset":
          updatedProperty = { image: value };
          break;
        case "URL":
          updatedProperty = { video: value };
          break;
        case "Boolean":
          updatedProperty = { checked: value };
          break;
        case "Int":
        case "Float":
          updatedProperty = { number: value };
          break;
        default:
          break;
      }

      if (Object.keys(updatedProperty).length) {
        const updatedProperties = {
          ...selectedFeature?.properties,
          ...updatedProperty,
        };
        onSubmit?.(updatedProperties);
      }
    },
    [field.id, field.type, onSubmit, selectedFeature?.properties, setField],
  );

  return field?.type === "Text" ? (
    <TextField
      key={field?.id}
      name={field?.title}
      value={selectedFeature?.properties.title ? selectedFeature?.properties.title : field.value}
      onChange={handleChange}
    />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      name={field?.title}
      value={
        selectedFeature?.properties.content ? selectedFeature?.properties.content : field.value
      }
      onChange={handleChange}
    />
  ) : field?.type === "Asset" ? (
    <URLField
      name={field?.title}
      entityType="image"
      fileType={"asset"}
      value={selectedFeature?.properties.image ? selectedFeature?.properties.image : field.value}
      onChange={handleChange}
    />
  ) : field?.type === "URL" ? (
    <URLField
      name={field?.title}
      entityType="file"
      fileType={"URL"}
      value={selectedFeature?.properties.video ? selectedFeature?.properties.video : field.value}
      onChange={handleChange}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      name={field?.title}
      value={selectedFeature?.properties.number ? selectedFeature?.properties.number : field.value}
      min={field?.min}
      max={field?.max}
      onChange={handleChange}
    />
  ) : field?.type === "Boolean" ? (
    <ToggleField
      key={field?.id}
      name={field?.title}
      checked={
        selectedFeature?.properties.checked ? selectedFeature?.properties.checked : field.value
      }
      onChange={handleChange}
    />
  ) : (
    <div>{t("Unsupported custom field")}</div>
  );
};
