import { SpacingValues } from "@reearth/beta/ui/fields/SpacingField";
import { Camera, LatLng } from "@reearth/beta/utils/value";
import { SchemaField } from "@reearth/services/api/propertyApi/utils";
import { FC, useMemo, useState } from "react";

import {
  ColorField,
  InputField,
  SelectField,
  TimePointField,
  TextareaField,
  AssetField,
  SpacingField,
  SwitchField,
  SliderField,
  NumberField,
  TwinInputField,
  CameraField,
  RangeField
} from "../../../ui/fields";
import { FieldValue } from "../types";

type Props = {
  initialValue: FieldValue;
  field: SchemaField;
  setUpdatedField: ({
    fieldId,
    value
  }: {
    fieldId: string;
    value: FieldValue;
  }) => void;
};

const PropertyItem: FC<Props> = ({ initialValue, field, setUpdatedField }) => {
  const [value, setValue] = useState<FieldValue>(initialValue);
  const assetTypes: "image"[] | "file"[] | undefined = useMemo(
    () =>
      field.type === "url"
        ? field.ui === "image"
          ? ["image" as const]
          : field.ui === "file"
            ? ["file" as const]
            : undefined
        : undefined,
    [field.type, field.ui]
  );

  const handleChange = (newValue?: FieldValue): void => {
    if (newValue) {
      setValue(newValue);
      setTimeout(() => {
        setUpdatedField({ fieldId: field.id, value: newValue });
      }, 300);
    }
  };

  return (
    <>
      {field.type === "string" ? (
        field.ui === "datetime" ? (
          <TimePointField
            key={field.id}
            title={field.name}
            value={value as string}
            description={field.description}
            onChange={(newValue?: string) => handleChange(newValue ?? "")}
          />
        ) : field.ui === "selection" ? (
          <SelectField
            key={field.id}
            title={field.name}
            value={(value as string) ?? ""}
            description={field.description}
            options={
              field?.choices?.map(
                ({ key, label }: { key: string; label: string }) => ({
                  value: key,
                  label: label
                })
              ) || []
            }
            onChange={handleChange}
          />
        ) : field.ui === "color" ? (
          <ColorField
            key={field.id}
            title={field.name}
            value={value as string}
            description={field.description}
            onChange={handleChange}
          />
        ) : field.ui === "multiline" ? (
          <TextareaField
            key={field.id}
            title={field.name}
            resizable="height"
            description={field.description}
            value={(value as string) ?? ""}
            onChange={handleChange}
          />
        ) : (
          <InputField
            key={field.id}
            title={field.name}
            value={value as string}
            description={field.description}
            onChange={handleChange}
            onBlur={handleChange}
          />
        )
      ) : field.type === "url" ? (
        <AssetField
          key={field.id}
          title={field.name}
          assetsTypes={assetTypes}
          description={field.description}
          inputMethod={
            field.ui === "video" || field.ui === undefined ? "URL" : "asset"
          }
          value={value as string}
          onChange={handleChange}
        />
      ) : field.type === "spacing" ? (
        <SpacingField
          key={field.id}
          title={field.name}
          value={(value as SpacingValues) ?? ""}
          description={field.description}
          min={field.min}
          max={field.max}
          onChange={handleChange}
        />
      ) : field.type === "bool" ? (
        <SwitchField
          key={field.id}
          title={field.name}
          description={field.description}
          value={!!value}
          onChange={handleChange}
        />
      ) : field.type === "number" ? (
        field.ui === "slider" ? (
          <SliderField
            key={field.id}
            title={field.name}
            value={value as number}
            description={field.description}
            min={field.min}
            max={field.max}
            onChange={handleChange}
          />
        ) : (
          <NumberField
            key={field.id}
            title={field.name}
            value={(value as number) ?? ""}
            unit={field.suffix}
            description={field.description}
            min={field.min}
            max={field.max}
            onChange={handleChange}
          />
        )
      ) : field.type === "latlng" ? (
        <TwinInputField
          key={field.id}
          title={field.name}
          values={[(value as LatLng)?.lat, (value as LatLng)?.lng]}
          description={field.description}
          onBlur={handleChange}
        />
      ) : field.type === "camera" ? (
        <CameraField
          key={field.id}
          title={field.name}
          value={value as Camera}
          description={field.description}
          onSave={handleChange}
        />
      ) : field.type === "array" && field.ui === "range" ? (
        <RangeField
          key={field.id}
          title={field.name}
          values={value as number[]}
          unit={field.suffix}
          min={field.min}
          max={field.max}
          content={["min", "max"]}
          description={field.description}
          onChange={(newValue: (number | undefined)[]) =>
            handleChange(newValue.filter((v): v is number => v !== undefined))
          }
        />
      ) : (
        <p key={field.id}>{field.name} field</p>
      )}
    </>
  );
};

export default PropertyItem;
