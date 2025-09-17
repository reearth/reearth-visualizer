import { SpacingValues } from "@reearth/app/ui/fields/SpacingField";
import { Camera, LatLng } from "@reearth/app/utils/value";
import type { SchemaField } from "@reearth/services/api/property";
import { FC, useCallback, useMemo } from "react";

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
  id: string;
  value: FieldValue;
  field: SchemaField;
  onUpdate: (id: string, value: FieldValue) => void;
};

const PropertyItem: FC<Props> = ({ id, value, field, onUpdate }) => {
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

  const handleChange = useCallback(
    (newValue?: FieldValue): void => {
      if (newValue) {
        onUpdate(id, newValue);
      }
    },
    [id, onUpdate]
  );

  return (
    <>
      {field.type === "string" ? (
        field.ui === "datetime" ? (
          <TimePointField
            key={field.id}
            title={field.title}
            value={value as string}
            description={field.description}
            onChange={handleChange}
          />
        ) : field.ui === "selection" ? (
          <SelectField
            key={field.id}
            title={field.title}
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
            title={field.title}
            value={value as string}
            description={field.description}
            onChange={handleChange}
          />
        ) : field.ui === "multiline" ? (
          <TextareaField
            key={field.id}
            title={field.title}
            resizable="height"
            description={field.description}
            value={(value as string) ?? ""}
            onChangeComplete={handleChange}
          />
        ) : (
          <InputField
            key={field.id}
            title={field.title}
            value={value as string}
            description={field.description}
            onChangeComplete={handleChange}
          />
        )
      ) : field.type === "url" ? (
        <AssetField
          key={field.id}
          title={field.title}
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
          title={field.title}
          value={(value as SpacingValues) ?? ""}
          description={field.description}
          min={field.min}
          max={field.max}
          onChange={handleChange}
        />
      ) : field.type === "bool" ? (
        <SwitchField
          key={field.id}
          title={field.title}
          description={field.description}
          value={!!value}
          onChange={handleChange}
        />
      ) : field.type === "number" ? (
        field.ui === "slider" ? (
          <SliderField
            key={field.id}
            title={field.title}
            value={value as number}
            description={field.description}
            min={field.min}
            max={field.max}
            onChange={handleChange}
          />
        ) : (
          <NumberField
            key={field.id}
            title={field.title}
            value={(value as number) ?? ""}
            unit={field.suffix}
            description={field.description}
            min={field.min}
            max={field.max}
            onChangeComplete={handleChange}
          />
        )
      ) : field.type === "latlng" ? (
        <TwinInputField
          key={field.id}
          title={field.title}
          values={[(value as LatLng)?.lat, (value as LatLng)?.lng]}
          description={field.description}
          onBlur={handleChange}
        />
      ) : field.type === "camera" ? (
        <CameraField
          key={field.id}
          title={field.title}
          value={value as Camera}
          description={field.description}
          onSave={handleChange}
        />
      ) : field.type === "array" && field.ui === "range" ? (
        <RangeField
          key={field.id}
          title={field.title}
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
        <p key={field.id}>{field.title} field</p>
      )}
    </>
  );
};

export default PropertyItem;
