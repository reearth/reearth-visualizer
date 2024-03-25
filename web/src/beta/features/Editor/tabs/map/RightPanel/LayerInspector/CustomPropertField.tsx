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
  setValue?: (v: any) => {};
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
      onSubmit?.({
        ...selectedFeature?.properties,
        [`data-type-${field.type.toLowerCase()}`]: value,
      });
    },
    [field.id, field.type, onSubmit, selectedFeature?.properties, setField],
  );

  return field?.type === "Text" ? (
    <TextField key={field?.id} name={field?.title} value={field?.value} onChange={handleChange} />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      name={field?.title}
      value={field?.value}
      description={field?.description}
      onChange={handleChange}
    />
  ) : field?.type === "Asset" ? (
    <URLField
      name={field?.title}
      entityType="image"
      fileType={"asset"}
      value={field?.value}
      description={field?.description}
      onChange={handleChange}
    />
  ) : field?.type === "URL" ? (
    <URLField
      name={field?.title}
      entityType="file"
      fileType={"URL"}
      value={field?.value}
      description={field?.description}
      onChange={() => {}}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      name={field?.title}
      value={field?.value}
      description={field?.description}
      min={field?.min}
      max={field?.max}
      onChange={() => {}}
    />
  ) : field?.type === "Boolean" ? (
    <ToggleField key={field?.id} name={field?.title} checked={!!field?.value} onChange={() => {}} />
  ) : (
    <div>{t("Unsupported field type")}</div>
  );
};
